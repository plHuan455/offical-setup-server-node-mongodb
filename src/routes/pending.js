import express from 'express';
import PendingController from '../controllers/PendingController.js';
const router = express.Router();

router.post('/', PendingController.create);
router.get('/', PendingController.get);
router.put('/:pendingId', PendingController.update);
router.delete('/:pendingId', PendingController.delete);

export default router;