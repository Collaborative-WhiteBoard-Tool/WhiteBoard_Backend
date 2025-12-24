import express from "express";
import { JwtPayload } from "jsonwebtoken";
import { JwtUserPayload } from "./token.type.ts";

declare global {
    namespace Express {
        export interface Request {
            user?: JwtUserPayload
            validated?: {
                body?: any;
                params?: any;
                query?: any;
            }
        }
    }
}