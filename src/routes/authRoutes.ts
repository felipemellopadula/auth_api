import express from 'express';
import { register, login, getUsers, getOneUser, updateUser, deleteUser } from '../controllers/authControllers';
import { authenticateToken } from '../utils/jwtUtils';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, getOneUser);
router.put('/:id', authenticateToken, updateUser); // Rota para atualizar um usuário
router.delete('/:id', authenticateToken, deleteUser); // Rota para deletar um usuário

export default router;
