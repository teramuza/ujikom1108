export const HttpStatusCode = {
    OK: 200,
    Created: 201,
    Accepted: 202,
    NoContent: 204,
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    InternalServerError: 500,
    ServiceUnavailable: 503,
} as const;

export type HttpStatusCodeType = typeof HttpStatusCode[keyof typeof HttpStatusCode];
