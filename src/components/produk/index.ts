import ProdukController from './produk.controller';
import { Router } from 'express';

const router = Router();

router.get('/', ProdukController.getAllProduk.bind(ProdukController));

router.get('/categories', ProdukController.getJenisProduk.bind(ProdukController));

router.get('/low-stock', ProdukController.getLowStockProduk.bind(ProdukController));

router.get('/:id', ProdukController.getProdukById.bind(ProdukController));

router.post('/', ProdukController.createProduk.bind(ProdukController));

router.put('/:id', ProdukController.updateProduk.bind(ProdukController));

router.patch('/:id/stock', ProdukController.updateStock.bind(ProdukController));

router.delete('/:id', ProdukController.deleteProduk.bind(ProdukController));

export default router;
