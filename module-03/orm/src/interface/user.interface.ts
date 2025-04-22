export interface IRegisterParam {
    email: string,
    password: string,
    first_name: string,
    last_name: string
    roleId: number
}

export interface ILoginParam {
    email: string,
    password: string
}

export interface IUpdateUser {
    file: Express.Multer.File,
    email: string
}