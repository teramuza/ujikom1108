import bcrypt from 'bcrypt';

export function hashPassword(userPassword: string | Buffer) {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(userPassword, salt);
}

export function comparePassword(userPassword: string | Buffer, hashedPassword: string) {
    return bcrypt.compareSync(userPassword, hashedPassword);
}
