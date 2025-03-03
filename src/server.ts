import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import errorHandler from './middlewares/errorHandler';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(helmet());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicialização do servidor
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
};

export default startServer;