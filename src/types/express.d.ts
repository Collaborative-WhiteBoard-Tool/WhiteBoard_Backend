import { z } from "zod";

declare global {
    namespace Express {
        export interface Request<ValidatedBody extends z.ZodTypeAny = z.ZodTypeAny,
            ValidatedParams extends z.ZodTypeAny = z.ZodTypeAny,
            ValidatedQuery extends z.ZodTypeAny = z.ZodTypeAny> {
            user?: JwtUserPayload;
            validated?: {
                body?: z.infer<ValidatedBody>;
                params?: z.infer<ValidatedParams>;
                query?: z.infer<ValidatedQuery>;
            }
        }
        export interface User {
            id: string;
            email: string;
            googleId?: string | null;
            provider?: string | null;
        }
    }
}
export { }