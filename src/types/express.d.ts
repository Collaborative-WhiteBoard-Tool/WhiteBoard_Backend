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
    }
}

// declare global {
//     namespace Express {
//         export interface Request {
//             user?: JwtUserPayload
//             validated?: {
//                 body?: any;
//                 params?: any;
//                 query?: any;
//             }
//         }
//     }
// }