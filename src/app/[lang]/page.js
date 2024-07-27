import { Portada } from '@/components/portada';
import EmpresaOnline from '@/components/importancia';
import Navbar from '@/components/navbar';
import { Slaider } from '@/components/carrucel/slaider';
import { datos } from '@/components/carrucel/db';
import Galeria from '@/components/galeria/galeria';

export default function Home({params}) {
  const idioma= params.lang;

  return (
    <div>
      <meta name="google-site-verification" content="6Wleb1gKWBvvhDhTruIXhwFweF4P7KhhoVpZ-UM1-y4" />
      <div className="w-full h-full">
        <Navbar/>
        <Portada/>
        <Slaider sliderList={datos[idioma].images.carrucel} />
        <EmpresaOnline/>
        <Galeria idioma={idioma}/>
      </div>
    </div>
  );
}
