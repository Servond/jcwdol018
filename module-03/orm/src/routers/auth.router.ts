import { Router } from "express";
import { RegisterController, LoginController, UsersController } from "../controllers/auth.controller";

const router = Router();

router.post("/register", RegisterController);
router.post("/login", LoginController);
router.get("/", UsersController);


export default router;