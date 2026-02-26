import { Router } from "express";
import { getMe, login, logout, refreshToken, register } from "../controllers/authController.js";
import { validated } from "../middlewares/validateMiddleware.js";
import { createUserSchema, loginSchema } from "../schemas/userSchema.js";
import { protect } from "../middlewares/auth/authMiddleware.js";

const router = Router();

router.post('/register', validated(createUserSchema, "body"), register)
router.post('/login', validated(loginSchema, "body"), login)
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)
router.post('/refresh-token', protect, refreshToken)

export default router;
