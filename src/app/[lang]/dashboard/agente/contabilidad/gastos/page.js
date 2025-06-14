// src/app/[lang]/dashboard/agente/contabilidad/gastos/page.js

import ExpenseManager from "../../components/ExpenseManager";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export default async function GastosPage() {
  // 1. Obtener la sesión y el ID de usuario
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    // En caso de no estar autenticado, NextAuth lo redirigirá según tu Layout
    return null;
  }
  const userId = session.user.id;

  // 2. Leer del usuario sus epígrafesIAE desde la BD
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { epigrafesIAE: true }
  });

  // 3. Pasar esos epígrafes como prop a ExpenseManager
  const misEpigrafes = usuario?.epigrafesIAE || [];

  return (
    <div className="max-w-2xl mx-auto mt-6 space-y-6">
      <ExpenseManager misEpigrafes={misEpigrafes} />
    </div>
  );
}
