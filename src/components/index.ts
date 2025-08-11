import express, { Router } from 'express';
import User from './user';
import Produk from './produk';
import Perusahaan from './perusahaan';
import Customer from './customer';
import Faktur from './faktur';

const router: Router = express.Router();
router.use('/auth', User);
router.use('/produk', Produk);
router.use('/perusahaan', Perusahaan);
router.use('/customer', Customer);
router.use('/faktur', Faktur);

export default router;
