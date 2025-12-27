import {
  delay,
  type HttpResponseResolver,
  type StrictRequest,
  type DefaultBodyType,
  type PathParams,
  type JsonBodyType,
} from "msw";

import { env } from "@/configs/env";
import { db } from "./db";
import { AuthenticationError, NotFoundError } from "@/lib/errors";

export const AUTH_COOKIE = `refreshToken` as const;

const copyWithoutCircularReferences = (
  references: object[],
  object: Record<string, unknown>
) => {
  const cleanObject = {} as Record<string, unknown>;
  Object.keys(object).forEach(function (key) {
    const value = object[key];
    if (value && typeof value === "object") {
      if (references.indexOf(value) < 0) {
        const v = value as Record<string, unknown>;
        references.push(value);
        cleanObject[key] = copyWithoutCircularReferences(references, v);
        references.pop();
      } else {
        cleanObject[key] = "###_Circular_###";
      }
    } else if (typeof value !== "function") {
      cleanObject[key] = value;
    }
  });
  return cleanObject;
};

export const toBase64 = (str: string) => {
  const uint8Array = new TextEncoder().encode(str);
  return String.fromCharCode(...uint8Array);
};

export const networkDelay = () => {
  const delayTime =
    env.NODE_ENV === "test" ? 200 : Math.floor(Math.random() * 700) + 300;

  return delay(delayTime);
};

export const cleanStringify = (object: Record<string, unknown>) => {
  if (object && typeof object === "object") {
    object = copyWithoutCircularReferences([object], object);
  }

  return JSON.stringify(object);
};

export const encode = <T extends object>(obj: T) => {
  const btoa =
    typeof window === "undefined"
      ? (str: string) => Buffer.from(str, "binary").toString("base64")
      : window.btoa;

  return btoa(toBase64(cleanStringify(obj as Record<string, unknown>)));
};

export const decode = (str: string): { id: string; username: string } => {
  const atob =
    typeof window === "undefined"
      ? (str: string) => Buffer.from(str, "base64").toString("binary")
      : window.atob;
  return JSON.parse(atob(str));
};

export const hash = (str: string) => {
  let hash = 5381,
    i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return String(hash >>> 0);
};

const omit = <T extends Record<string, unknown>>(obj: T, keys: string[]) => {
  const result = {} as T;
  for (const key in obj) {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
  }

  return result;
};

export const sanitizeUser = <O extends Record<string, unknown>>(
  user: O
): Omit<typeof user, "password"> => omit<O>(user, ["password"]);

export const authenticate = ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = db.user.findFirst((q) =>
    q.where({
      email,
    })
  );

  if (user?.password === hash(password)) {
    const sanitizedUser = sanitizeUser(user);
    const encodedRefreshToken = encode(sanitizedUser);
    const encodedToken = encode(sanitizedUser);
    return {
      user: sanitizedUser,
      accessToken: encodedToken,
      refreshToken: encodedRefreshToken,
    };
  }

  const error = new AuthenticationError("Invalid credentials.");
  throw error;
};

type AuthInput<TParams, TRequestBodyType extends JsonBodyType> = {
  request: StrictRequest<TRequestBodyType>;
  requestId: string;
  params: TParams;
  cookies: Record<string, string>;
};

export const withAuth = <
  TParams extends PathParams,
  TRequestBodyType extends DefaultBodyType,
  TResponseBodyType extends DefaultBodyType,
>(
  resolver: HttpResponseResolver<TParams, TRequestBodyType, TResponseBodyType>
) => {
  return (input: AuthInput<TParams, TRequestBodyType>) => {
    const { request } = input;

    const bearerHeader = request.headers.get("Authorization");

    if (!bearerHeader) {
      const error = new AuthenticationError("Invalid or expired token");

      throw error;
    }

    const bearer = bearerHeader.split(" ");

    const accessToken = bearer[1];

    if (typeof accessToken !== "string") {
      throw new AuthenticationError("Invalid or expired token");
    }

    return resolver(input);
  };
};

const extractToken = <T extends JsonBodyType>(request: StrictRequest<T>) => {
  const bearerHeader = request.headers.get("Authorization");

  const bearer = bearerHeader!.split(" ");

  return bearer[1] as string;
};

const extractUser = (token: string) => {
  const decodedToken = decode(token) as { id: string };

  const user = db.user.findFirst((q) =>
    q.where({
      id: decodedToken.id,
    })
  );

  if (!user) {
    const error = new NotFoundError("User not found");

    throw error;
  }

  return user;
};

export const requireAuth = <T extends JsonBodyType>(
  request: StrictRequest<T>
) => {
  const token = extractToken(request);

  return extractUser(token);
};
