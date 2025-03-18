import express from 'express';
import { register, login, getUsers, getOneUser, updateUser, deleteUser, googleLogin, getCurrentUser } from '../controllers/authControllers';
import { authenticateToken } from '../utils/jwtUtils';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/', authenticateToken, getUsers);
router.get('/me', authenticateToken, getCurrentUser); // Nova rota
router.get('/:id', authenticateToken, getOneUser);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUser);

export default router;