import { Router } from "express";
import { RegisterController } from "../controllers/auth.controller";

const router = Router();

router.post("/register", RegisterController);

export default router;