import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwtUtils';
import { RegisterInput } from '../schemas/userSchema';

const prisma = new PrismaClient();

export const registerUser = async (data: RegisterInput) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Usuário não encontrado');

  if (user.password === null) {
    throw new Error('Usuário não tem senha definida. Use login com Google.');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw new Error('Senha inválida');

  const token = generateToken(user.id);
  return { user, token };
};

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      password: false,
    },
  });
  return users;
};

export const getUserById = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      password: false,
    },
  });
  return user;
};

export const updateUserInDB = async (userId: number, data: any) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });
  return updatedUser;
};

export const deleteUserInDB = async (userId: number) => {
  const deletedUser = await prisma.user.delete({
    where: { id: userId },
  });
  return deletedUser;
};