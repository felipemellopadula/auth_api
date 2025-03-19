import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwtUtils';
import { registerSchema, updateUserSchema } from '../schemas/userSchema';
import { registerUser, loginUser, getAllUsers, getUserById, updateUserInDB, deleteUserInDB } from '../services/authService';

// Define a custom Request interface that extends the base Request
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
  };
}

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Função para login com Google
export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('req.body:', req.body); // Adicione este log para depurar

  try {
    const { token, credential } = req.body; // Aceita tanto "token" quanto "credential"
    const googleToken = token || credential; // Usa o que estiver presente

    if (!googleToken) {
      res.status(400).json({ error: 'Google token is required' });
      return;
    }

    // Verificar o token do Google
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(400).json({ error: 'Invalid token payload' });
      return;
    }

    const { email, name, sub: googleId } = payload;

    // Verificar se o usuário já existe
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Se não existir, criar um novo usuário
      const defaultPassword = await bcrypt.hash('google-auth', 10);
      user = await prisma.user.create({
        data: {
          name: name || 'Google User',
          email,
          password: defaultPassword,
          subscription: 'free',
        },
      });
      console.log(`Novo usuário criado: ${email}`);
    } else {
      console.log(`Usuário encontrado: ${email}`);
    }

    // Gerar token JWT para o usuário
    const jwtToken = generateToken(user.id);
    res.status(200).json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email }, token: jwtToken });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(401).json({ error: 'An unexpected error occurred' });
    }
  }
};
// Outras funções (mantidas como estão, mas ajustadas para incluir `next`)
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await registerUser(validatedData);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      next(error);
    } else {
      res.status(400).json({ error: 'An unexpected error occurred' });
      next(error);
    }
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);
    res.status(200).json({ message: 'Login successful', user, token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
      next(error);
    } else {
      res.status(401).json({ error: 'An unexpected error occurred' });
      next(error);
    }
  }
};

export const getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ users });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      next(error);
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
      next(error);
    }
  }
};

export const getOneUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const user = await getUserById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      next(error);
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
      next(error);
    }
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    if (req.user?.userId !== userId) {
      res.status(403).json({ error: 'You can only update your own account' });
      return;
    }

    const updatedData = req.body;
    const updatedUser = await updateUserInDB(userId, updatedData);

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      next(error);
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
      next(error);
    }
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    if (req.user?.userId !== userId) {
      res.status(403).json({ error: 'You can only delete your own account' });
      return;
    }

    const deletedUser = await deleteUserInDB(userId);

    if (!deletedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      next(error);
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
      next(error);
    }
  }
};

// Função para obter o usuário logado
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subscription: true,
        history: true,
        password: false, // Não retorna a senha
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      next(error); // Passa o erro para o middleware de erro
    } else {
      res.status(500).json({ error: 'Erro inesperado' });
      next(error);
    }
  }
};