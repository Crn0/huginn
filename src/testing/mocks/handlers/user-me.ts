import { HttpResponse, http } from "msw";

import { env } from "@/configs/env";

import {
  AUTH_COOKIE,
  hash,
  networkDelay,
  requireAuth,
  withAuth,
} from "../utils";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import {
  deleteAccount,
  followUser,
  getUser,
  unfollowUser,
  updateUsername,
  updateUserPassword,
  updateUserProfile,
} from "@/testing/test-utils";
import { transformAuthUser } from "@/testing/data-generators";

const baseURL = `${env.SERVER_URL}/api/v${env.API_VERSION}/users/me`;

interface FollowBody {
  followId: string;
}

interface UpdateUsernameBody {
  username: string;
}

interface UpdateProfileBody {
  displayName?: string;
  bio?: string;
  birthdate?: Date;
  location?: string;
  website?: string;
}

interface UpdatePasswordBody {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

export const userMeHandlers = [
  http.get(
    baseURL,
    withAuth(async ({ request }) => {
      await networkDelay();

      try {
        const user = requireAuth(request);

        const transformedUser = transformAuthUser(user);

        return HttpResponse.json(transformedUser, { status: 200 });
      } catch (e) {
        const error = e as NodeJS.ErrnoException;

        return HttpResponse.json(
          { message: error?.message || "Server Error" },
          { status: 500 }
        );
      }
    })
  ),
  http.post(
    `${baseURL}/follow`,
    withAuth(async ({ request }) => {
      await networkDelay();

      try {
        const followObject = (await request.json()) as FollowBody;

        const user = requireAuth(request);

        const _followUser = getUser(followObject.followId);

        await followUser({ user, followUser: _followUser });

        return new HttpResponse(null, {
          status: 204,
        });
      } catch (e) {
        const error = e as NodeJS.ErrnoException;

        return HttpResponse.json(
          { message: error?.message || "Server Error" },
          { status: 500 }
        );
      }
    })
  ),
  http.patch(
    `${baseURL}/username`,
    withAuth(async ({ request }) => {
      await networkDelay();

      try {
        const updateBody = (await request.json()) as UpdateUsernameBody;

        const user = requireAuth(request);

        const updatedUser = await updateUsername(user.id, updateBody.username);

        if (!updatedUser) {
          return HttpResponse.json(
            { message: "User not found." },
            { status: 404 }
          );
        }

        return HttpResponse.json(
          {
            id: updatedUser.id,
            username: updatedUser.username,
          },
          {
            status: 200,
          }
        );
      } catch (e) {
        const error = e as NodeJS.ErrnoException;

        return HttpResponse.json(
          { message: error?.message || "Server Error" },
          { status: 500 }
        );
      }
    })
  ),
  http.patch(
    `${baseURL}/profile`,
    withAuth(async ({ request }) => {
      await networkDelay();

      try {
        const formData = await request.formData();

        const updateBody = Object.fromEntries(formData) as UpdateProfileBody;

        const user = requireAuth(request);

        const updatedUser = await updateUserProfile(user.id, updateBody);

        if (!updatedUser) {
          return HttpResponse.json(
            { message: "User not found." },
            { status: 404 }
          );
        }

        return HttpResponse.json(
          {
            id: updatedUser.id,
            username: updatedUser.username,
          },
          {
            status: 200,
          }
        );
      } catch (e) {
        const error = e as NodeJS.ErrnoException;

        return HttpResponse.json(
          { message: error?.message || "Server Error" },
          { status: 500 }
        );
      }
    })
  ),
  http.patch(
    `${baseURL}/password`,
    withAuth(async ({ request }) => {
      await networkDelay();

      try {
        const updateBody = (await request.json()) as UpdatePasswordBody;

        const { id } = requireAuth(request);

        const user = getUser(id);

        const oldPassword = hash(updateBody.oldPassword);

        if (user.password !== oldPassword) {
          const error = new ForbiddenError("Incorrect old password.");
          return HttpResponse.json(
            {
              ...error,
            },
            { status: 403 }
          );
        }

        const updatedUser = await updateUserPassword(
          user.id,
          updateBody.password
        );

        if (!updatedUser) {
          return HttpResponse.json(
            { message: "User not found." },
            { status: 404 }
          );
        }

        return new HttpResponse(null, {
          headers: {
            "Set-Cookie": `${AUTH_COOKIE}=; Path=/;`,
          },
          status: 204,
        });
      } catch (e) {
        const error = e as NodeJS.ErrnoException;

        return HttpResponse.json(
          { message: error?.message || "Server Error" },
          { status: 500 }
        );
      }
    })
  ),
  http.delete(
    baseURL,
    withAuth(async ({ request }) => {
      await networkDelay();

      try {
        const user = requireAuth(request);

        deleteAccount(user.id);

        return new HttpResponse(null, {
          headers: {
            "Set-Cookie": `${AUTH_COOKIE}=; Path=/;`,
          },
          status: 204,
        });
      } catch (e) {
        const error = e as NodeJS.ErrnoException;

        return HttpResponse.json(
          { message: error?.message || "Server Error" },
          { status: 500 }
        );
      }
    })
  ),
  http.delete(
    `${baseURL}/follow/:followId`,
    withAuth(async ({ request, params }) => {
      await networkDelay();

      try {
        const { followId } = params;

        if (typeof followId !== "string") {
          const error = new ValidationError(
            "Validation failed: 1 errors detected in body",
            [
              {
                code: "custom",
                path: ["followId"],
                message: "Invalid ID",
              },
            ]
          );

          return HttpResponse.json({ ...error }, { status: 422 });
        }

        const user = requireAuth(request);

        const _unfollowUser = getUser(followId);

        await unfollowUser({ user, unfollowUser: _unfollowUser });

        return new HttpResponse(null, {
          status: 204,
        });
      } catch (e) {
        const error = e as NodeJS.ErrnoException;

        return HttpResponse.json(
          { message: error?.message || "Server Error" },
          { status: 500 }
        );
      }
    })
  ),
];
