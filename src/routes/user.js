import express from 'express';
const router = express.Router();
import UserController from '../controllers/UserController.js';

router.patch('/set-admin', UserController.setAdmin);
router.post('/create', UserController.create);

export default router;