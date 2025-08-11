import express, { Router } from 'express';
import User from './user';
import Produk from './produk';
import Perusahaan from './perusahaan';
import Customer from './customer';

const router: Router = express.Router();
router.use('/auth', User);
router.use('/produk', Produk);
router.use('/perusahaan', Perusahaan);
router.use('/customer', Customer);

export default router;
