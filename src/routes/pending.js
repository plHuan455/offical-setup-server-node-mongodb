import express from 'express';
import PendingController from '../controllers/PendingController.js';
const router = express.Router();

router.post('/create', PendingController.create);
router.patch('/update', PendingController.update);
router.get('/get-pending/:groupSlug', PendingController.get);
router.delete('/delete-pending/:pendingId', PendingController.delete);

export default router;