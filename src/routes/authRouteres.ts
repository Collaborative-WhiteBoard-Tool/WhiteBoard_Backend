import { Router } from "express";
import { login, register } from "../controllers/authController.js";
import { validated } from "../middlewares/validateMiddleware.js";
import { createUserSchema, loginSchema } from "../schemas/userSchema.js";

const router = Router();

router.post('/register', validated(createUserSchema, "body"), register)
router.post('/login', validated(loginSchema, "body"), login)

export default router;
