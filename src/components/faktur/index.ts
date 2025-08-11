import express, { Router } from 'express';
import FakturController from './faktur.controller';

const router: Router = express.Router();

// Get all fakturs
router.get('/', FakturController.getAllFaktur.bind(FakturController));

// Get faktur statistics
router.get('/stats', FakturController.getFakturStats.bind(FakturController));

// Get faktur by ID
router.get('/:id', FakturController.getFakturById.bind(FakturController));

// Get detail items for a specific faktur
router.get('/:id/details', FakturController.getDetailFaktur.bind(FakturController));

// Create new faktur
router.post('/', FakturController.createFaktur.bind(FakturController));

// Update faktur
router.put('/:id', FakturController.updateFaktur.bind(FakturController));

// Update detail items for existing faktur
router.put('/:id/details', FakturController.updateDetailFaktur.bind(FakturController));

// Delete faktur
router.delete('/:id', FakturController.deleteFaktur.bind(FakturController));

export default router;
