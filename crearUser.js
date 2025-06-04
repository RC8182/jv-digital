//node crearUser.js "Javier Visconti" javiervisconti7@gmail.com 28645455

// crearUser.js
// crearUser.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const [,, name, email, password] = process.argv;
  if (!name || !email || !password) {
    console.error('Uso: node crearUser.js "Nombre completo" correo@ejemplo.com contraseña');
    process.exit(1);
  }

  // Hasheamos la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Upsert del usuario
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword
    },
    create: {
      name,
      email,
      password: hashedPassword
    }
  });

  console.log('Usuario creado/actualizado:', {
    id:    user.id,
    name:  user.name,
    email: user.email
  });
}

main()
  .catch(e => {
    console.error('Error al crear usuario:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
