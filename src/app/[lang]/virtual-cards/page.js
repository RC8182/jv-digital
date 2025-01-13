import Image from "next/image";
import One from "/public/images/shape/offer-shadow-shape.png";
import Two from "/public/images/shape/offer-bg-shape-left.png";
import Three from "/public/images/shape/offer-bg-shape-right.png";
import Four from "/public/images/icon/section-title.png";
import DeviceFrame from "@/components/deviseIfram/deviseIframe";
import CmnBanner from "@/components/cmnBanner";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/footer";
import ScrollProgressButton from "@/components/ScrollProgressButton";

const VirtualCard = ({ params }) => {
  const idioma = params.lang || 'es';
  const contenido = {
    es: {
      title: "Tarjetas Virtuales Personalizables",
      subtitle: "Tarjetas Virtuales",
      parrafo: [
        "Descubre nuestras tarjetas virtuales 100% personalizables, diseñadas con un enfoque eco amigable, lo que significa que son respetuosas con el medio ambiente y ayudan a reducir el uso de papel.",
        "Con nuestras tarjetas, tus invitados pueden confirmar su presencia, integrarlas fácilmente a sus calendarios y establecer recordatorios.",
        "Además, incluyen accesos directos a la ubicación del evento y la opción de cargar imágenes que se guardarán automáticamente en tu tarjeta para descargarlas después.",
        "¡Y no olvides el código QR que permite a tus invitados acceder rápidamente a hacer fotos!",
        "Organiza tu evento de manera única y sostenible."
      ]
    },
    en: {
      title: "Customizable Virtual Cards",
      subtitle: "Virtual Cards",
      parrafo: [
        "Discover our 100% customizable virtual cards, designed with an eco-friendly approach, meaning they are respectful of the environment and help reduce paper use.",
        "With our cards, your guests can confirm their attendance, easily integrate them into their calendars, and set reminders.",
        "Additionally, they include direct access to the event location and the option to upload images that will be automatically saved to your card for later download.",
        "And don’t forget the QR code that allows your guests to quickly access photo opportunities!",
        "Organize your event in a unique and sustainable way."
      ]
    },
    it: {
      title: "Inviti Virtuali Personalizzabili",
      subtitle: "Carte Virtuali",
      parrafo: [
        "Scopri i nostri inviti virtuali 100% personalizzabili, progettate con un approccio eco-friendly, ciò che significa che rispettano l'ambiente e aiutano a ridurre l'uso della carta.",
        "Con le nostre schede, i tuoi invitati possono confermare la loro presenza, integrarli facilmente nei loro calendari e impostare promemoria.",
        "Inoltre, includono collegamenti diretti alla posizione dell'evento e la possibilità di caricare immagini che verranno salvate automaticamente nel tuo invito per scaricarle in seguito.",
        "E non dimenticare il codice QR che consente ai tuoi invitati di accedere rapidamente per fare foto!",
        "Organizza il tuo evento in modo unico e sostenibile."
      ]
    },
  };

  const { title, subtitle, parrafo } = contenido[idioma];

  return (
    <>
      <Navbar idioma={idioma}/>
      <CmnBanner title={subtitle} />
      <ScrollProgressButton/>
      <section className="section-area bg-gray-900 pt-32 pb-48 mt-4">
        {/* Sombras e imágenes laterales */}
        <div className="section__shape-left" data-aos="fade-left" data-aos-delay="0" data-aos-duration="1500">
          <Image className="animate-swayY" src={One} alt="Shape Left" priority />
        </div>
        <div className="section__shape-left" data-aos="zoom-in-down" data-aos-delay="400" data-aos-duration="1500">
          <Image src={Two} alt="shape" priority />
        </div>
        <div className="section__shape-right" data-aos="zoom-in-down" data-aos-delay="400" data-aos-duration="1500">
          <Image src={Three} alt="shape" priority />
        </div>

        {/* Contenedor principal */}
        <div className="section__container flex flex-col">
          <div className="section-header text-primary mb-16 text-xl">
            <h2 className="uppercase font-medium flex items-center">
              <Image className="mr-2" src={Four} alt="icon" priority />
              {subtitle}
            </h2>
            <h3 className="text-white capitalize text-3xl">
              {title}
            </h3>
            {parrafo.map((texto, index) => (
              <p key={index} className="text-white mb-4 ">
                {texto}
              </p>
            ))}
          </div>
          <div className="section__container flex flex-wrap justify-center items-center gap-8">
            <DeviceFrame src={`https://jv-digital.com/${idioma}/vp/fabrizio`} device="mobile" />
            <DeviceFrame src={`https://jv-digital.com/${idioma}/vp/50`} device="mobile" />
            <DeviceFrame src={`https://jv-digital.com/${idioma}/vp/sabrina`} device="mobile" />
            <DeviceFrame src={`https://jv-digital.com/${idioma}/vp/baut`} device="mobile" />
            <DeviceFrame src={`https://jv-digital.com/${idioma}/vp/matrimonio`} device="mobile" />
          </div>
        </div>
      </section>
      <Footer idioma={idioma}/>
    </>
  );
};

export default VirtualCard;
