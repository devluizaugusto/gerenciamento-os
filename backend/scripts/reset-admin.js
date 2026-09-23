const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@helpdesk.ti';
  const senha = 'admin123';
  const senha_hash = await bcrypt.hash(senha, 12);

  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: {
      senha_hash,
      ativo: true,
      role: 'admin',
      nome: 'Administrador',
    },
    create: {
      nome: 'Administrador',
      email,
      senha_hash,
      role: 'admin',
      ativo: true,
    },
  });

  console.log('==============================================');
  console.log('ACESSO DO ADMINISTRADOR RECUPERADO');
  console.log('E-mail:', usuario.email);
  console.log('Senha:  admin123');
  console.log('Status:', usuario.ativo ? 'ATIVO' : 'INATIVO');
  console.log('==============================================');
}

main()
  .catch((error) => {
    console.error('\nNão foi possível recuperar o acesso.');
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
