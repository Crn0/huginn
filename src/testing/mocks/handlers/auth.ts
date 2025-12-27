import { HttpResponse, http } from "msw";

import { ConflictError } from "@/lib/errors";
import { env } from "@/configs/env";

import { db } from "../db";
import { AUTH_COOKIE, authenticate, hash, networkDelay } from "../utils";
import { generateId } from "@/lib/generate-id";
import { tryCatch } from "@/lib/try-catch";
import { generateUser } from "@/testing/data-generators";

type RegisterBody = {
  displayName: string;
  email: string;
  password: string;
  birthdate: string;
};

type LoginBody = {
  email: string;
  password: string;
};

const baseURL = `${env.SERVER_URL}/api/${env.API_VERSION}/auth`;

export const authHandlers = [
  http.post(`${baseURL}/register`, async ({ request }) => {
    await networkDelay();

    try {
      const userObject = (await request.json()) as RegisterBody;

      const existingUser = db.user.findFirst((q) =>
        q.where({
          email: userObject.email,
        })
      );

      if (existingUser) {
        const error = new ConflictError("Unique constraint violation", {
          message: "Email has already been taken.",
          path: ["email"],
          code: "EMAIL_CONFLICT",
        });

        return HttpResponse.json({ ...error }, { status: 409 });
      }

      const user = await db.user.create(
        generateUser({
          email: userObject.email,
          password: hash(userObject.password),
          username: userObject.displayName,
          profile: {
            id: generateId(),
            displayName: userObject.displayName,
            birthday: new Date(userObject.birthdate),
            bio: null,
            location: null,
            website: null,
            avatar: null,
            banner: null,
          },
        })
      );

      return HttpResponse.json(
        {
          id: user.id,
          username: user.username,
        },
        { status: 200 }
      );
    } catch (e) {
      const error = e as NodeJS.ErrnoException;

      return HttpResponse.json(
        { message: error?.message || "Server Error" },
        { status: 500 }
      );
    }
  }),

  http.post(`${baseURL}/login`, async ({ request }) => {
    await networkDelay();

    try {
      const credentials = (await request.json()) as LoginBody;
      const { error, data } = tryCatch(() => authenticate(credentials));

      if (error) {
        return;
      }

      const { accessToken, refreshToken } = data;

      return HttpResponse.json(
        { token: accessToken },
        {
          headers: {
            "Set-Cookie": `${AUTH_COOKIE}=${refreshToken}; Path=/;`,
          },
        }
      );
    } catch (e) {
      const error = e as NodeJS.ErrnoException;

      return HttpResponse.json(
        { message: error?.message || "Server Error" },
        { status: 500 }
      );
    }
  }),

  http.post(`${baseURL}/logout`, async () => {
    await networkDelay();

    return new HttpResponse(null, {
      status: 204,
      headers: {
        "Set-Cookie": `${AUTH_COOKIE}=; Path=/;`,
      },
    });
  }),
];
