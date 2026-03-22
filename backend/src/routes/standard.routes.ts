import { Router } from 'express';
import * as standardController from '../controllers/standard.controller';

const router = Router();

router.get('/', standardController.getStandards);

export default router;