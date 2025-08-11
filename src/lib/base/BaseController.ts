import { Request, Response } from 'express';
import { ValidationError } from 'sequelize';
import { ErrorObject } from '@types';
import ResponseHandler from './ResponseHandler';

class BaseController extends ResponseHandler {
    constructor() {
        super();
    }

    protected getQueryId(req: Request, key = 'id') {
        const id = req.query?.[key];
        if (!id || isNaN(Number(id))) {
            return undefined;
        }
        return Number(id);
    }

    protected getParamId(req: Request, key = 'id') {
        const id = req.params?.[key];
        if (!id || isNaN(Number(id))) {
            return undefined;
        }
        return Number(id);
    }

    private validateValueType<T>(value: unknown) {
        if (typeof value === 'string') {
            if (typeof ({} as T) === 'number') {
                return Number(value) as T;
            }
            if (typeof ({} as T) === 'boolean') {
                return (value === 'true') as T;
            }
        }

        return value as T;
    }

    protected getParamValue<T = string>(req: Request, key: string) {
        const value = req.params?.[key];
        return this.validateValueType<T>(value);
    }

    protected getQueryValue<T = string>(req: Request, key: string) {
        const value = req.query?.[key];
        return this.validateValueType<T>(value);
    }

    protected getBodyValue<T = string>(req: Request, key: string) {
        const value = req.body?.[key];
        return this.validateValueType<T>(value);
    }

    protected handleError<ErrorT extends Record<string, any> = Record<string, any>>(res: Response, error: ErrorObject<ErrorT>) {
        if ((error as ValidationError).errors) {
            const err = (error as ValidationError).errors[0];
            this.badRequestResponse(res, err?.message, 40000, {
                validation_key: err.path,
                validation_type: err.validatorKey,
            });
        } else {
            this.badRequestResponse(
                res,
                error?.message,
                error?.code ?? 0,
                error?.data,
            );
        }
    }
}

export default BaseController;
