import { Request, Response, NextFunction } from "express";
import { RegisterService } from "../services/auth.service";

async function RegisterController (req: Request, res: Response, next: NextFunction) {
    try {
        const data = await RegisterService(req.body);

        res.status(200).send({
            message: "Register Berhasil",
            data
        })
    } catch(err) {
        next(err)
    }
}

export { RegisterController}