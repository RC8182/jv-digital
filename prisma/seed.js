const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?search_path=auth",
    },
  },
});

async function main() {
  const hashed = await bcrypt.hash("111111", 10);

  await prisma.user.upsert({
    where: { email: "admin@ejemplo.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@ejemplo.com",
      password: hashed,
    },
  });

  console.log("✅ Usuario 'admin@ejemplo.com' creado con contraseña '111111'");
}

main()
  .catch((e) => {
    console.error("❌ Error al ejecutar seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
