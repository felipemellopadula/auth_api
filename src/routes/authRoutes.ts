import express from 'express';
import { register, login, getUsers, getOneUser, updateUser, deleteUser } from '../controllers/authControllers';
import { authenticateToken } from '../utils/jwtUtils';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, getOneUser);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUser);

export default router;