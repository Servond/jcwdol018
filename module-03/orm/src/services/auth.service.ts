import { User } from "@prisma/client";
import { IRegisterParam, ILoginParam } from "../interface/user.interface";
import prisma from "../lib/prisma";
import { hash, genSaltSync, compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { cloudinaryUpload, cloudinaryRemove } from "../utils/cloudinary";
import { Transporter } from "../utils/nodemailer";

import handlebars from "handlebars";
import path from "path";
import fs from "fs";

import { SECRET_KEY } from "../config";

async function GetAll() {
  try {
    return await prisma.user.findMany();
  } catch (err) {
    throw err;
  }
}

async function FindUserByEmail(email: string) {
  try {
    const user = await prisma.user.findFirst({
      select: {
        email: true,
        first_name: true,
        last_name: true,
        password: true,
        role: {
          select: {
            name: true,
          },
        },
      },
      where: {
        email,
      },
      // include: {
      //   role: true
      // }
    });
    // select * from user where email = email limit 1

    return user;
  } catch (err) {
    throw err;
  }
}

async function RegisterService(param: IRegisterParam) {
  try {
    // validasi ketika email sudah terdaftar
    const isExist = await FindUserByEmail(param.email);

    if (isExist) throw new Error("Email sudah terdaftar");

    await prisma.$transaction(async (t) => {
      const salt = genSaltSync(10);
      const hashedPassword = await hash(param.password, salt);

      let user = await t.user.create({
        data: {
          first_name: param.first_name,
          last_name: param.last_name,
          email: param.email,
          password: hashedPassword,
          isVerified: false,
          roleId: param.roleId,
        },
      });

      const payload = {
        email: user.email,
      };
  
      const token = sign(payload, String(SECRET_KEY), { expiresIn: "15m" });

      const templatePath = path.join(
        __dirname,
        "../templates",
        "register-template.hbs"
      );

      const templateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = handlebars.compile(templateSource);
      const html = compiledTemplate({ email: param.email, fe_url: `http://localhost:3000/activation?token=${token}`})
      
      await Transporter.sendMail({
        from: "EOHelper",
        to: param.email,
        subject: "Welcome",
        html
      });

      return user;
    });

    // insert into user(first_name, last_name, email, password, isverified) values(param.first_name, param.last_name, param.email, param.password, false)
  } catch (err) {
    throw err;
  }
}

async function LoginService(param: ILoginParam) {
  try {
    const user = await FindUserByEmail(param.email);

    if (!user) throw new Error("Email tidak terdaftar");

    const checkPass = await compare(param.password, user.password);

    if (!checkPass) throw new Error("Password Salah");

    const payload = {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role.name,
    };

    const token = sign(payload, String(SECRET_KEY), { expiresIn: "1h" });

    return { user: payload, token };
  } catch (err) {
    throw err;
  }
}

async function UpdateUserService(file: Express.Multer.File, email: string) {
  let url = "";
  try {
    const checkUser = await FindUserByEmail(email);

    if (!checkUser) throw new Error("User not found");

    await prisma.$transaction(async (t) => {
      const { secure_url } = await cloudinaryUpload(file);
      url = secure_url;
      const splitUrl = secure_url.split("/");
      const fileName = splitUrl[splitUrl.length - 1];

      await t.user.update({
        where: {
          email: checkUser.email,
        },
        data: {
          avatar: fileName,
        },
      });
    });
  } catch (err) {
    await cloudinaryRemove(url);
    throw err;
  }
}

async function UpdateUserService2(file: Express.Multer.File, email: string) {
  try {
    const checkUser = await FindUserByEmail(email);

    if (!checkUser) throw new Error("User not found");

    await prisma.$transaction(async (t) => {
      await t.user.update({
        where: {
          email: checkUser.email,
        },
        data: {
          avatar: file.filename,
        },
      });
    });
  } catch (err) {
    throw err;
  }
}

async function VerifyUserService() {
  try {
    console.log("function ini berjalan")
    await prisma.$transaction(async (t) => {
      await t.user.updateMany({
        where: {
          isVerified: false
        },
        data: {
          isVerified: true,
        },
      });
    });
  } catch (err) {
    throw err;
  }
}

export {
  RegisterService,
  LoginService,
  GetAll,
  UpdateUserService,
  UpdateUserService2,
  VerifyUserService
};
