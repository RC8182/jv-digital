import Image from "next/image";
import Five from "/public/images/banner/banner-two-circle-solid.png";
import Six from "/public/images/banner/banner-two-circle-regular.png";

const Portada = ({ idioma }) => {
  const contenido = {
    es: {
      text: {
        title: "Lleva tu negocio al siguiente nivel",
        description: "Expertos en Marketing Digital y Estrategias Empresariales",
        slogan: "Tu presencia Online, ",
        slogan1:"nuestra prioridad"
      },
    },
    en: {
      text: {
        title: "Take Your Business to the Next Level",
        description: "Experts in Digital Marketing and Business Strategies",
        slogan: "Your online presence,",
        slogan1:"our priority"
      },
    },
    it: {
      text: {
        title: "Porta la tua attività al livello successivo",
        description: "Esperti in Marketing Digitale e Strategie Aziendali",
        slogan: "La tua presenza online,",
        slogan1:"la nostra priorità"
      },
    },
  };

  const { text } = contenido[idioma];

  return (
    <section className="relative h-screen flex justify-center items-center "
    style={{
      backgroundImage: "linear-gradient(to bottom, navy, black, navy)",
      overflow: "hidden"
    }}>
      {/* Rotating Pentagon Circles */}
      <div className="absolute bottom-[-10%] left-[-10%]  w-96 h-96 animate-spin-slow origin-center">
        <Image src={Five} alt="Pentágono Uno" priority />
      </div>
      <div className="absolute bottom-[-10%]  left-[-10%]  w-96 h-96 animate-spin-reverse origin-center">
        <Image src={Six} alt="Pentágono Dos" priority />
      </div>

      {/* Text Content - Centramos el contenedor completo */}
      <div className="absolute w-full h-full flex flex-col justify-center items-center text-center">
        <h4 className="text-white text-2xl md:text-4xl mb-4">{text.title}</h4>
        <h1 className="text-[#3464E1] text-6xl md:text-8xl font-bold mb-6"           
        data-aos="fade-up"
        data-aos-delay="0"
        data-aos-duration="1500">{text.slogan} <br/> {text.slogan1}</h1>
        <p className="text-white text-2xl md:text-4xl">{text.description}</p>
      </div>
    </section>
  );
};

export default Portada;
