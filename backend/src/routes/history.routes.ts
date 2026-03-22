import { Router } from 'express';
import * as historyController from '../controllers/history.controller';

const router = Router();

router.get('/', historyController.getAllHistory);
router.post('/', historyController.createHistory);
router.post('/delete', historyController.deleteHistory);
router.get('/:id', historyController.getHistoryById);
router.patch('/:id', historyController.patchHistory);

export default router;