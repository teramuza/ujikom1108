import { Request, Response } from 'express';
import db from '@model';
import { comparePassword, hashPassword } from '@utils/passwordUtils';
import { generateToken } from '@utils/tokenUtils';
import BaseController from '@lib/base/BaseController';

class UserController extends BaseController {
    public async register(req: Request, res: Response) {
        try {
            const { name, username, password } = req.body;
            if (!name || !username || !password) {
                return res.status(400).json({ message: 'Semua field wajib diisi' });
            }

            const existing = await db.User.findOne({ where: { username } });
            if (existing) {
                return res.status(400).json({ message: 'Username sudah digunakan' });
            }

            const hashedPassword = hashPassword(password);
            const user = await db.User.create({ name, username, pass: hashedPassword });
            res.status(201).json({
                message: 'User berhasil didaftarkan',
                data: { id: user.id, name: user.name, username: user.username },
            });
        } catch (error: any) {
            res.status(500).json({ message: 'Error register user', error: error.message });
        }
    }

    public async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;
            if (!username || !password) return res.status(400).json({ message: 'Username dan password wajib diisi' });

            const user = await db.User.findOne({ where: { username } });
            if (!user) return res.status(401).json({ message: 'Username atau password salah' });

            const validPassword = comparePassword(password, user.pass);
            if (!validPassword) return res.status(401).json({ message: 'Username atau password salah' });

            const token = generateToken({ id: user.id, name: user.name });

            res.json({
                message: 'Login berhasil',
                token,
                user: { id: user.id, name: user.name, username: user.username },
            });
        } catch (error: any) {
            res.status(500).json({ message: 'Error login', error: error.message });
        }
    }

}

export default new UserController();

