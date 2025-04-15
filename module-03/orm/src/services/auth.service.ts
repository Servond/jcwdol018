import { IRegisterParam } from "../interface/user.interface";
import prisma from "../lib/prisma";

async function FindUserByEmail(email: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
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

    const user = await prisma.user.create({
      data: {
        first_name: param.first_name,
        last_name: param.last_name,
        email: param.email,
        password: param.password,
        isVerified: false,
      },
    });

    return user;

    // insert into user(first_name, last_name, email, password, isverified) values(param.first_name, param.last_name, param.email, param.password, false)
  } catch (err) {
    throw err;
  }
}

export { RegisterService}