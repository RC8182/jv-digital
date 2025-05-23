// prisma/seed.js
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()
async function main() {
  const hashed = await bcrypt.hash("111111", 10)
  await prisma.user.upsert({
    where: { email: "admin@ejemplo.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@ejemplo.com",
      password: hashed,
    },
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
