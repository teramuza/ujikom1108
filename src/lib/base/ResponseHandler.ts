import { Response } from 'express';
import { HttpStatusCode, HttpStatusCodeType } from '@constants/HTTPCodes';
import { ErrorResponse } from '@utils/responseUtils';
import logging from '../../utils/logging';

class ResponseHandler {
    protected successHandler<T = Record<string, any>>(
        res: Response,
        message?: string,
        data?: T,
        status?: HttpStatusCodeType,
    ) {
        return res.status(status || HttpStatusCode.OK).json({ message, data });
    }

    protected unauthorizedResponse(res: Response, error?: ErrorResponse) {
        logging.error('unauthorized', error?.code, error?.data);
        return res.status(HttpStatusCode.Unauthorized).json({
            type: 'unauthorized',
            error: error,
        });
    }

    protected forbiddenResponse(res: Response, error?: ErrorResponse) {
        logging.error(error);
        return res.status(HttpStatusCode.Forbidden).json({
            type: 'forbidden',
            error,
        });
    }

    protected badRequestResponse(
        res: Response,
        message?: string,
        errorCode?: number,
        errorInfo?: Record<string, any>,
    ) {
        return res.status(HttpStatusCode.BadRequest).json({
            type: 'bad_request',
            error: {
                message,
                code: errorCode,
                info: errorInfo,
            },
        });
    }

    protected serverErrorResponse(res: Response, error?: any) {
        logging.error('server_error', error);
        return res.status(HttpStatusCode.InternalServerError).json({
            type: 'server_error',
            error,
        });
    }
}

export default ResponseHandler;
