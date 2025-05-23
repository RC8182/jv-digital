import EmpresaOnline from '@/components/importancia/importancia';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/footer';
import About from '@/components/about/about';
import GoogleAnalytics from './googleAnalytics';
import Portada from '@/components/portada/4/portada';
import ScrollProgressButton from '@/components/ScrollProgressButton';
import Services from '@/components/Services';


export const metadata = {
  es: {
    title: "JV-Digital: Tu Presencia Online",
    description: "Innovación y eficiencia en Gestión Integral de Redes Sociales y Soluciones Informáticas.",
    icon: "https://jv-digital.com/icons/home/icon.png",
  },
  en: {
    title: "JV-Digital: Your Online Presence",
    description: "Innovation and Efficiency in Comprehensive Management of Social Media and IT Solutions.",
    icon: "https://jv-digital.com/icons/home/icon.png",
  },
  it: {
    title: "JV-Digital: La Tua Presenza Online",
    description: "Innovazione ed Efficienza nella Gestione Integrale dei Social Media e Soluzioni Informatiche.",
    icon: "https://jv-digital.com/icons/home/icon.png",
  },
};

export default function Home({ params }) {
  const idioma = params?.lang && metadata[params.lang] ? params.lang : 'es'; // Fallback a 'es' si params.lang es inválido
  const { title, description, icon } = metadata[idioma];

  return (
    <html lang={idioma}>
      <head>
        <title>{title}</title>
        <meta name="description" 
        content={description} />
        <meta name="google-site-verification" content="6Wleb1gKWBvvhDhTruIXhwFweF4P7KhhoVpZ-UM1-y4" />
        {/* Etiquetas Open Graph para WhatsApp */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={icon} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="300" />
        <meta property="og:image:height" content="300" />
        <meta property="og:url" content={`https://jv-digital.com/${idioma}`} />  
        <meta property="og:type" content="website" /> 
        <link rel="preload" href="https://jv-digital.com/icons/home/icon.png" as="image" type="image/png"/>     
        <link rel="icon" href={icon} type="image/png" />
        <link rel="apple-touch-icon" href={icon} />
      </head>
      <body>
        <GoogleAnalytics idioma={idioma} />
        <ScrollProgressButton />
        <Navbar idioma={idioma} />
        <Portada idioma={idioma} />
        <EmpresaOnline idioma={idioma} />
        <Services idioma={idioma} />
        <About idioma={idioma} />
        <Footer idioma={idioma} />
      </body>
    </html>
  );
}


