import express from 'express';
import WordController from '../controllers/WordController.js';
const router = express.Router();

router.get('/', WordController.get);
router.post('/', WordController.create);
router.post('/action', WordController.action);
router.put('/:wordId', WordController.update);
router.delete('/:wordId', WordController.delete);

export default router;