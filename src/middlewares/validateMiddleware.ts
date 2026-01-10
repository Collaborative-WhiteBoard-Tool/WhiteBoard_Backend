// middleware/validateMiddleware.ts
import { ZodType } from "zod";
import { Request, Response, NextFunction } from "express";
import { RESPONSE_CODES } from "../constants/responseCodes.js";

export const validated = (schema: ZodType<unknown>, target: "body" | "params" | "query") =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[target]);

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            }));
            const { httpStatus, message, code } = RESPONSE_CODES.VALIDATION_ERROR
            return res.status(httpStatus).json({
                status: "fail",
                code,
                message,
                errors,
            });
        }

        req.validated = req.validated || {};
        req.validated[target] = result.data;

        next();
    };



