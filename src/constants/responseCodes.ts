import exp from "node:constants";
import { HttpStatusCode} from "./HttpStatusCode";

export const RESPONSE_CODES = {
    //SUCCESS
    SUCCESS: { httpStatus: HttpStatusCode.OK, code: 2000, message: "Success"},
    CREATED: { httpStatus: HttpStatusCode.CREATED, code: 2001, message: "Created successfully!"},
    UPDATED: { httpStatus: HttpStatusCode.OK, code: 2002, message: "Updated successfully!"},
    DELETED: { httpStatus: HttpStatusCode.OK, code: 2003, message: "Deleted successfully!"},


    // ⚠️ Validation & Input
    VALIDATION_ERROR: { httpStatus: HttpStatusCode.BAD_REQUEST, code: 4000, message: "Validation error"},
    INVALID_INPUT: {httpStatus: HttpStatusCode.BAD_REQUEST, code: 4001, message: "Invalid input"},

    // // 📌 Business Errors
      BOARD_NOT_FOUND: { httpStatus: HttpStatusCode.NOT_FOUND, code: 3000, message: "Board not found" },
      STROKE_NOT_FOUND: { httpStatus: HttpStatusCode.NOT_FOUND, code: 3001, message: "Stroke not found" },
    //   USER_NOT_FOUND: { code: 2102, message: "User not found" },
    //   DUPLICATE_RESOURCE: { code: 2103, message: "Resource already exists" },
    //
    //   // 🔒 Authentication & Authorization
    //   UNAUTHORIZED: { code: 4000, message: "Unauthorized" },
    //   FORBIDDEN: { code: 4001, message: "Forbidden" },
    //   TOKEN_EXPIRED: { code: 4002, message: "Token expired" },
    //   INVALID_TOKEN: { code: 4003, message: "Invalid token" },
    //
    //   // 💥 Server Errors
      INTERNAL_ERROR: { httpStatus: HttpStatusCode.INTERNAL_SERVER_ERROR, code: 5000, message: "Internal server error"},
      DATABASE_ERROR: { httpStatus: HttpStatusCode.INTERNAL_SERVER_ERROR, code: 5001, message: "Database error"},
    //   SERVICE_UNAVAILABLE: { code: 5002, message: "Service temporarily unavailable" },


} as const;
export type ResponseCodeKey = keyof typeof RESPONSE_CODES;