import EmpresaOnline from '@/components/importancia';
import { Slaider } from '@/components/carrucel/slaider';
import { datos } from '@/components/carrucel/db';
import Galeria from '@/components/galeria/galeria';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import HeroSection from '@/components/HeroSection/HeroSection';
import About from '@/components/about';
import GoogleAnalytics from './googleAnalytics';
import IFrameComponent from '@/components/IFrameComponent';

const traducciones = {
  es: {
    webSites: "Sitios Web",
    socialNetworks: "Redes Sociales",
    virtualCards: "Tarjetas Virtuales"
  },
  en: {
    webSites: "Web Sites",
    socialNetworks: "Social Networks"
  },
  it: {
    webSites: "Siti Web",
    socialNetworks: "Reti Sociali"
  }
};

export default function Home({ params }) {
  const idioma = params.lang;
  const { webSites, socialNetworks, virtualCards } = traducciones[idioma];

  return (
    <div>
      <meta name="google-site-verification" content="6Wleb1gKWBvvhDhTruIXhwFweF4P7KhhoVpZ-UM1-y4" />
      <div className="w-full h-full">
      <GoogleAnalytics idioma={idioma} />
        <nav>
          <Navbar idioma={idioma} />
        </nav>
        <section>
          <HeroSection idioma={idioma} />
        </section>
        <section>
          <EmpresaOnline idioma={idioma} />
        </section>
        <section className='bg-blue-900'>
          <h2 className='text-metal text-center text-4xl p-4'>{webSites}</h2>
          <Slaider sliderList={datos[idioma].images.carrucel} />
        </section>
        <section className='bg-blue-900 mt-4 mb-4'>
          <h2 className='text-metal text-center text-4xl p-4'>{socialNetworks}</h2>
          <Galeria idioma={idioma} />
        </section>
        <section className='bg-blue-900 mt-4 mb-4'>
          <h2 className='text-metal text-center text-4xl p-4'>{virtualCards}</h2>
          <IFrameComponent src="https://jv-digital.com/es/vp/fabrizio" />
        </section>
        <section>
          <About idioma={idioma} />
        </section>
        <footer>
          <Footer idioma={idioma} />
        </footer>
      </div>
    </div>
  );
}
