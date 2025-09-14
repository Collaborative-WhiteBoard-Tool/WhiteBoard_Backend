// middleware/validateMiddleware.ts
import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import {RESPONSE_CODES} from "../constants/responseCodes";
import {ApiResponse} from "../utils/ApiResponse";

export const validate = (schema: ZodSchema, location: "body" | "query" | "param") => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (location === "body") schema.parse(req.body);
            if (location === "query") schema.parse(req.query);
            if (location === "param") schema.parse(req.params);

            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(RESPONSE_CODES.VALIDATION_ERROR.httpStatus).json(ApiResponse.error("VALIDATION_ERROR", err.message));
            }
            next(err);
        }
    };
};
