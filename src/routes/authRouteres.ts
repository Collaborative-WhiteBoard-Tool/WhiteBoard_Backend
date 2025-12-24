import { Router } from "express";
import { register } from "../controllers/authController.js";
import { validated } from "../middlewares/validateMiddleware.js";
import { createUserSchema } from "../schemas/userSchema.js";

const router = Router();

router.post('/register', validated(createUserSchema, "body"), register)

export default router;
