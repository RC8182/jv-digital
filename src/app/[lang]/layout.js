import { Inter,  Dancing_Script, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

 
const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'], // Puedes elegir los pesos que necesites
  style: ['normal'], // Agrega el estilo cursivo
  variable: '--dancing-script',
});

export const metadata = {
  title: "JV-Digital: Tu Presencia OnLine",
  description: "JV-Digital: Javier Visconti - Experto en Informática y Programación. Innovación y eficiencia en Gestión Integral de Redes Sociales. Soluciones digitales a tu medida",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto_mono.variable} ${dancingScript.variable} `}>{children}
      
      </body>
    </html>
  );
}
