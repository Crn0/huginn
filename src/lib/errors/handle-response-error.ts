import { ApiError } from "./api-error";
import { ConflictError } from "./conflict-error";
import { AuthenticationError } from "./auth-error";
import { ValidationError } from "./validation-error";
import { ForbiddenError } from "./forbidden-error";
import { BadRequestError } from "./bad-request-error";
import { NotFoundError } from "./notfound-error";
import { InternalServerError } from "./internal-server-error";

export const handleResponseError = async (response: Response) => {
  if (!response.ok) {
    let error;
    let message = "Something went wrong";

    let resError;
    const status = response.status;

    if (response.headers.get("content-type")?.includes("application/json")) {
      resError = await response.clone().json();
    }

    if (typeof resError?.message === "string") {
      message = resError.message;
    }

    switch (status) {
      case 400: {
        error = new BadRequestError(message);
        break;
      }
      case 401: {
        error = new AuthenticationError(message);
        break;
      }
      case 403: {
        error = new ForbiddenError(message);
        break;
      }
      case 404: {
        error = new NotFoundError(message);
        break;
      }
      case 409: {
        error = new ConflictError(message, resError.field);
        break;
      }
      case 422: {
        error = new ValidationError(message, resError.issues);
        break;
      }

      case 500: {
        error = new InternalServerError(message);
        break;
      }

      default: {
        error = new ApiError(message, status, {
          code: resError?.code,
        });
        break;
      }
    }

    return error;
  }

  return null;
};
