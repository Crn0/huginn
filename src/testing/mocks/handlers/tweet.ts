import { HttpResponse, http } from "msw";

import { env } from "@/configs/env";

import { networkDelay, requireAuth, withAuth } from "../utils";
import { NotFoundError, ValidationError } from "@/lib/errors";
import {
  createTweet,
  deleteTweet,
  getTweet,
  replyTo,
} from "@/testing/test-utils";

const baseURL = `${env.SERVER_URL}/api/v${env.API_VERSION}/tweets`;

type CreateTweetBody = {
  content: string;
};

export const tweetHandlers = [
  http.post(
    baseURL,
    withAuth(async ({ request }) => {
      await networkDelay();

      try {
        const formData = await request.formData();
        const tweetObject = Object.fromEntries(formData) as CreateTweetBody;

        const user = requireAuth(request);

        const tweet = await createTweet({
          author: user,
          content: tweetObject.content,
        });

        return HttpResponse.json(
          { id: tweet.id, content: tweet.content },
          { status: 200 }
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
  http.post(
    `${baseURL}/:id/replies`,
    withAuth(async ({ request, params }) => {
      await networkDelay();

      try {
        const formData = await request.formData();
        const tweetObject = Object.fromEntries(formData) as CreateTweetBody;

        const { id } = params;

        if (typeof id !== "string") {
          const error = new ValidationError(
            "Validation failed: 1 errors detected in body",
            [
              {
                code: "custom",
                path: ["id"],
                message: "Invalid ID",
              },
            ]
          );

          return HttpResponse.json({ ...error }, { status: 422 });
        }

        const tweet = getTweet(id);

        if (!tweet) {
          const error = new NotFoundError("Tweet not found");

          return HttpResponse.json({ ...error }, { status: 404 });
        }

        const user = requireAuth(request);

        const reply = await replyTo({
          author: user,
          content: tweetObject.content,
          replyTo: tweet,
        });

        return HttpResponse.json(
          {
            id: reply.id,
            content: reply.content,
            replyTo: { id: reply.replyTo?.id },
          },
          { status: 200 }
        );
      } catch (e) {
        const error = e as NodeJS.ErrnoException & { status?: number };

        return HttpResponse.json(
          { message: error?.message || "Server Error" },
          { status: error.status ?? 500 }
        );
      }
    })
  ),
  http.delete(
    `${baseURL}/:id`,
    withAuth(async ({ params }) => {
      await networkDelay();

      try {
        const { id } = params;

        if (typeof id !== "string") {
          const error = new ValidationError(
            "Validation failed: 1 errors detected in body",
            [
              {
                code: "custom",
                path: ["id"],
                message: "Invalid ID",
              },
            ]
          );

          return HttpResponse.json({ ...error }, { status: 422 });
        }

        const tweet = getTweet(id);

        deleteTweet(tweet.id);

        return new HttpResponse(null, { status: 204 });
      } catch (e) {
        const error = e as NodeJS.ErrnoException & { status?: number };

        return HttpResponse.json(
          { message: error?.message || "Server Error" },
          { status: error.status ?? 500 }
        );
      }
    })
  ),
];
