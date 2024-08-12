import EmpresaOnline from '@/components/importancia';
import { Slaider } from '@/components/carrucel/slaider';
import { datos } from '@/components/carrucel/db';
import Galeria from '@/components/galeria/galeria';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import HeroSection from '@/components/HeroSection/HeroSection';
import About from '@/components/about';

const traducciones = {
  es: {
    webSites: "Sitios Web",
    socialNetworks: "Redes Sociales"
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
  const { webSites, socialNetworks } = traducciones[idioma];

  return (
    <div>
      <meta name="google-site-verification" content="6Wleb1gKWBvvhDhTruIXhwFweF4P7KhhoVpZ-UM1-y4" />
      <div className="w-full h-full">
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
          <h2 className='text-white text-center text-4xl p-4'>{webSites}</h2>
          <Slaider sliderList={datos[idioma].images.carrucel} />
        </section>
        <section className='bg-blue-900 mt-4 mb-4'>
          <h2 className='text-white text-center text-4xl p-4'>{socialNetworks}</h2>
          <Galeria idioma={idioma} />
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
