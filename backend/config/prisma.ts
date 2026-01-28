import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar Prisma Client (lê DATABASE_URL automaticamente do .env)
const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// Tratamento de erros e desconexão ao encerrar
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit();
});

export default prisma;
