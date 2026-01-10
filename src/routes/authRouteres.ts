import { Router } from "express";
import { getMe, login, logout, register } from "../controllers/authController.js";
import { validated } from "../middlewares/validateMiddleware.js";
import { createUserSchema, loginSchema } from "../schemas/userSchema.js";
import { protect } from "../middlewares/auth/authMiddleware.js";

const router = Router();

router.post('/register', validated(createUserSchema, "body"), register)
router.post('/login', validated(loginSchema, "body"), login)
router.post('/me', protect, getMe)
router.post('/logout', logout)

export default router;
