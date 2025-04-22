import { Router } from "express";
import { RegisterController, LoginController, UsersController, UpdateProfileController, UpdateProfileController2 } from "../controllers/auth.controller";
import { VerifyToken, EOGuard } from "../middlewares/auth.middleware";
import ReqValidator from "../middlewares/validator.middleware";
import { Multer } from "../utils/multer";

import { registerSchema, loginSchema } from "../schemas/user.schema";

const router = Router();

router.post("/register", ReqValidator(registerSchema), RegisterController);
router.post("/login", ReqValidator(loginSchema), LoginController);
router.patch("/avatar", VerifyToken, Multer("memoryStorage").single("file"), UpdateProfileController);
router.patch("/avatar2", VerifyToken, Multer("diskStorage", "AVT", "avatar").single("file"), UpdateProfileController2);

router.get("/", VerifyToken, EOGuard, UsersController);


export default router;