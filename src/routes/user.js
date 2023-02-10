import express from 'express';
const router = express.Router();
import UserController from '../controllers/UserController.js';
import tokenMiddleware from '../midlewares/tokenMidleware.js';

router.patch('/set-admin', UserController.setAdmin);
router.post('/login', UserController.login);
router.post('/register', UserController.register);
router.post('/check-username', UserController.checkUsername);
router.post('/check-email', UserController.checkEmail);
router.get('/', tokenMiddleware, UserController.getUserData);

export default router;