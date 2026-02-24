import { Router } from 'express';
import { listHistory, createHistory, removeHistory, clearHistoryAll } from './history.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listHistory);
router.post('/', createHistory);
router.delete('/clear', clearHistoryAll);
router.delete('/:id', removeHistory);

export default router;
