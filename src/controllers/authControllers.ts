import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getAllUsers, getUserById, updateUserInDB, deleteUserInDB } from '../services/authService';
import { registerSchema, updateUserSchema } from '../schemas/userSchema';


// Define a custom Request interface that extends the base Request
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
  };
}

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await registerUser(validatedData);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unexpected error occurred' });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);
    res.status(200).json({ message: 'Login successful', user, token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(401).json({ error: 'An unexpected error occurred' });
    }
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ users });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
};

export const getOneUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await getUserById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return; // Sai da função, retornando void
    }

    res.status(200).json({ user });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);

    if (req.user?.userId !== userId) {
      res.status(403).json({ error: 'You can only update your own account' });
      return; // Sai da função, retornando void
    }

    const updatedData = req.body;
    const updatedUser = await updateUserInDB(userId, updatedData);

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return; // Sai da função, retornando void
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);

    if (req.user?.userId !== userId) {
      res.status(403).json({ error: 'You can only delete your own account' });
      return; // Sai da função, retornando void
    }

    const deletedUser = await deleteUserInDB(userId);

    if (!deletedUser) {
      res.status(404).json({ error: 'User not found' });
      return; // Sai da função, retornando void
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
};