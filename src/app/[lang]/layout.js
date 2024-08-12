import { Inter } from "next/font/google";
import "./globals.css";
import ScrollToTopButton from "@/components/scrollUp";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "JV-Digital: Tu Presencia OnLine",
  description: "JV-Digital: Javier Visconti - Experto en Informática y Programación. Innovación y eficiencia en Gestión Integral de Redes Sociales. Soluciones digitales a tu medida",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}
      <ScrollToTopButton/>
      </body>
    </html>
  );
}
