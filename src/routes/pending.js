import express from 'express';
import PendingController from '../controllers/PendingController.js';
const router = express.Router();

router.post('/', PendingController.create);
router.get('/', PendingController.get);
router.patch('/update', PendingController.update);
router.delete('/delete-pending/:pendingId', PendingController.delete);

export default router;