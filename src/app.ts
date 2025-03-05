import express from 'express';
import "reflect-metadata";
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import errorHandler from './middlewares/errorHandler';
import cors from "cors";


dotenv.config();

// Inicia o servidor

export const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);

// Middleware de tratamento de erros
app.use(errorHandler);