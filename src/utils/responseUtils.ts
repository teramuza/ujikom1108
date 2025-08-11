import { Response } from 'express';
import logging from '@utils/logging';
import { HttpStatusCode, HttpStatusCodeType } from '@constants/HTTPCodes';
import { ErrorObject } from '@types';

interface IResponse {
    message?: string;
    data?: Record<string, any>;
}

export type ErrorResponse<Data = Record<string, any>> = ErrorObject<Data>;

const successResponse = (
    res: Response,
    message?: string,
    optionalData: IResponse = {},
    status?: HttpStatusCodeType,
) => {
    if (message) {
        optionalData.message = message;
    }
    res.status(status || HttpStatusCode.OK).json(optionalData);
    return;
};

const unauthorizedResponse = (res: Response, error?: ErrorResponse) => {
    logging.error(error);
    res.status(HttpStatusCode.Unauthorized).json({
        type: 'unauthorized',
        error: error,
    });
    return;
};

const forbiddenResponse = (res: Response, error?: ErrorResponse) => {
    logging.error(error);
    res.status(HttpStatusCode.Forbidden).json({
        type: 'forbidden',
        error,
    });
    return;
};

const badRequestResponse = (
    res: Response,
    error: ErrorResponse,
    status?: HttpStatusCodeType,
) => {
    logging.error(error);
    res.status(status || HttpStatusCode.BadRequest).json({
        type: 'bad_request',
        error,
    });
    return;
};

const serverErrorResponse = (res: Response, error: ErrorResponse) => {
    logging.error(error);
    res.status(HttpStatusCode.InternalServerError).json({
        type: 'server_error',
        error,
    });
    return;
};

const validationErrorResponse = (
    res: Response,
    error: ErrorResponse,
    status?: HttpStatusCodeType,
) => {
    logging.error(error);
    res.status(status || HttpStatusCode.BadRequest).json({
        type: 'validation_error',
        error: error,
    });
    return;
};

const notFoundResponse = (res: Response, message?: string) => {
    res.status(HttpStatusCode.NotFound).json({
        type: 'not_found',
        message,
    });
    return;
};

export default {
    successResponse,
    unauthorizedResponse,
    forbiddenResponse,
    badRequestResponse,
    serverErrorResponse,
    validationErrorResponse,
    notFoundResponse,
};
