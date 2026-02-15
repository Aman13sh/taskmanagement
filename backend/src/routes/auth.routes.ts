import { Router } from "express";
import {
  login,
  register,
  refreshAccessToken,
  logout,
  getCurrentUser
} from "../controller/auth.controller";
import { verifyAccessToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);

// Protected route - requires valid access token
router.get("/me", verifyAccessToken, getCurrentUser);

export default router;
