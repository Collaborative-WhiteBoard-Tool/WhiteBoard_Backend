import { HttpStatusCode } from "./HttpStatusCode.js";

export const RESPONSE_CODES = {
  //SUCCESS
  SUCCESS: { httpStatus: HttpStatusCode.OK, code: 2000, message: "Success" },
  CREATED: { httpStatus: HttpStatusCode.CREATED, code: 2001, message: "Created successfully!" },
  // UPDATED: { httpStatus: HttpStatusCode.OK, code: 2002, message: "Updated successfully!"},
  // DELETED: { httpStatus: HttpStatusCode.OK, code: 2003, message: "Deleted successfully!"},

  //Not found 
  NOT_FOUND: { httpStatus: HttpStatusCode.NOT_FOUND, code: 4004, message: "Not found" },

  // ⚠️ Validation & Input
  VALIDATION_ERROR: { httpStatus: HttpStatusCode.BAD_REQUEST, code: 4000, message: "Validation error" },
  // INVALID_INPUT: { httpStatus: HttpStatusCode.BAD_REQUEST, code: 4001, message: "Invalid input" },

  // // 📌 Business Errors
  BOARD_NOT_FOUND: { httpStatus: HttpStatusCode.NOT_FOUND, code: 3000, message: "Board not found" },
  STROKE_NOT_FOUND: { httpStatus: HttpStatusCode.NOT_FOUND, code: 3001, message: "Stroke not found" },
  //   USER_NOT_FOUND: { code: 2102, message: "User not found" },
  //   DUPLICATE_RESOURCE: { code: 2103, message: "Resource already exists" },

  //   // 🔒 Authentication & Authorization
  EMAIL_EXISTS: { httpStatus: HttpStatusCode.CONFLICT, code: 4001, message: "Email already exists" },
  USERNAME_EXISTS: { httpStatus: HttpStatusCode.CONFLICT, code: 4002, message: "Username already exists" },
  UNAUTHORIZED: { httpStatus: HttpStatusCode.UNAUTHORIZED, code: 4003, message: "INVALID_CREDENTIALS" },
  // TOKEN
  MALFORMED_TOKEN: { httpStatus: HttpStatusCode.UNAUTHORIZED, code: 4101, message: "Malformed token payload", },
  EXPIRED_TOKEN: { httpStatus: HttpStatusCode.UNAUTHORIZED, code: 4102, message: "Token expired" },
  INVALID_TOKEN: { httpStatus: HttpStatusCode.UNAUTHORIZED, code: 4103, message: "Invalid token" },
  //   FORBIDDEN: { httpStatus: HttpStatusCode.UNAUTHORIZED, code: 4001, message: "Forbidden" },

  //   // 💥 Server Errors
  INTERNAL_ERROR: { httpStatus: HttpStatusCode.INTERNAL_SERVER_ERROR, code: 5000, message: "Internal server error" },
  DATABASE_ERROR: { httpStatus: HttpStatusCode.INTERNAL_SERVER_ERROR, code: 5001, message: "Database error" },
  //   SERVICE_UNAVAILABLE: { code: 5002, message: "Service temporarily unavailable" },


} as const;
export type ResponseCodeKey = keyof typeof RESPONSE_CODES;