import PerusahaanController from "@component/perusahaan/perusahaan.controller";
import { Router } from "express";

const router = Router();

router.get('/stats', PerusahaanController.getPerusahaanStats.bind(PerusahaanController));

router.get('/', PerusahaanController.getAllPerusahaan.bind(PerusahaanController));

router.get('/:id', PerusahaanController.getPerusahaanById.bind(PerusahaanController));

router.post('/', PerusahaanController.createPerusahaan.bind(PerusahaanController));

router.put('/:id', PerusahaanController.updatePerusahaan.bind(PerusahaanController));

router.delete('/:id', PerusahaanController.deletePerusahaan.bind(PerusahaanController));

export default router;
