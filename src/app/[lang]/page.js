import EmpresaOnline from '@/components/importancia/importancia';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/footer';
import About from '@/components/about/about';
import GoogleAnalytics from './googleAnalytics';
import Service from '@/components/Service';
import Portada from '@/components/portada/4/portada';
import ScrollProgressButton from '@/components/ScrollProgressButton';
import Solutions from '@/components/Solutions';




export default function Home({ params }) {
  const idioma = params.lang || 'es';

  return (
    <div>
      <meta name="google-site-verification" content="6Wleb1gKWBvvhDhTruIXhwFweF4P7KhhoVpZ-UM1-y4" />
      <div className="w-full h-full">
        <GoogleAnalytics idioma={idioma} />

        <ScrollProgressButton/>
        <Navbar idioma={idioma} />
        <Portada idioma={idioma}/>
        <EmpresaOnline idioma={idioma} />
        {/* <Service idioma={idioma}/> */}
         <Solutions idioma={idioma}/> 
        <About idioma={idioma} />
        <Footer idioma={idioma} />
      </div>
    </div>
  );
}
