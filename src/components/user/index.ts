import UserController from "@component/user/user.controller";
import {Router} from "express";

const router = Router();

router.post('/register', UserController.register.bind(UserController));
router.post('/login', UserController.login.bind(UserController));

export default router;
