import Image from "next/image";
import One from "/public/images/shape/offer-shadow-shape.png";
import Two from "/public/images/shape/offer-bg-shape-left.png";
import Three from "/public/images/shape/offer-bg-shape-right.png";
import Four from "/public/images/icon/section-title.png";
import Five from "/public/images/shape/offter-item-shape-top.png";
import Six from "/public/images/shape/offter-item-shape-bottom.png";

// Importamos iconos de React Icons
import { FaThumbsUp, FaGlobe, FaIdCard } from 'react-icons/fa'; 
import Link from "next/link";

const Ir = ({url, idioma}) => {
  const titulo= (idioma === 'es')? 'Ver': (idioma === 'en')? 'See':'Vedi';
  return (
    <Link href={`${idioma}/${url}`} className="text-primary border border-gray rounded-md m-4 p-2">
        {titulo}
    </Link>
  )
}



const Services = ({ idioma }) => {
  const contenido = {
    es: {
      title: "Impulsa el Progreso con las Últimas Tendencias Tecnológicas",
      subtitle: "Servicios",
      solutions: {
        website: {
          label: "Sitios Web",
          hoverLabel: "Creamos websites a tu gusto",
        },
        cards: {
          label: "Tarjetas de invitación",
          hoverLabel: "Creamos tarjetas personalizadas",
        },
        facebook: {
          label: "Redes Sociales",
          hoverLabel: "Gestionamos tus Redes Sociales",
        },
      },
    },
    en: {
      title: "Drive Progress with the Latest Technology Trends",
      subtitle: "Services",
      solutions: {
        website: {
          label: "Websites",
          hoverLabel: "We create custom websites for you",
        },
        cards: {
          label: "Invitation cards",
          hoverLabel: "We create personalized cards",
        },        
        facebook: {
          label: "Social Networks",
          hoverLabel: "We manage your Social Networks",
        },
      },
    },
    it: {
      title: "Promuovi il Progresso con le Ultime Tendenze Tecnologiche",
      subtitle: "Servizi",
      solutions: {
        website: {
          label: "Siti Web",
          hoverLabel: "Creiamo siti web personalizzati",
        },
        cards: {
          label: "Biglietti d'invito",
          hoverLabel: "Creiamo biglietti personalizzati",
        },
        facebook: {
          label: "Social Media",
          hoverLabel: "Gestiamo le tue Social Medie",
        },

      },
    },
  };

  const { title, subtitle, solutions } = contenido[idioma];

  return (
    <section className="section-area bg-gray-900 pt-32 pb-48 mt-4" id="servicios">
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
      <div className="section__container">
        <div className="section-header text-primary mb-16 text-xl">
          <h2 className="uppercase font-medium flex items-center">
            <Image className="mr-2" src={Four} alt="icon" priority />
            {subtitle}
          </h2>
          <h3 className="text-white capitalize text-3xl">
            {title}
          </h3>
        </div>

        {/* Ofertas */}
        <div className="flex justify-center flex-wrap gap-8">
          {[
            {
              icon: <FaGlobe size={36} color="#3C72FC" />,
              label: solutions.website.label,
              hoverLabel: solutions.website.hoverLabel,
              delay: 0,
              component:<Image className="mr-2" src={'/photos/services/1.svg'} width={1500} height={1500} alt="icon" priority />,
              button:'' 
              // <Ir idioma={idioma} url={'websites'}/>,
            },
            {
              icon: <FaIdCard size={36} color="#3C72FC" />,
              label: solutions.cards.label,
              hoverLabel: solutions.cards.hoverLabel,
              delay: 0,
              component:<Image className="mr-2" src={'/photos/services/2.svg'} width={1500} height={1500} alt="icon" priority />,
              button: <Ir idioma={idioma} url={'virtual-cards'}/>,
            },
            {
              icon: <FaThumbsUp   size={36} color="#3C72FC" />,
              label: solutions.facebook.label,
              hoverLabel: solutions.facebook.hoverLabel,
              delay: 100,
              component:<Image className="mr-2 rounded-lg" src={'/photos/services/3.png'} width={150} height={150} alt="icon" priority />,
              button: <Ir idioma={idioma} url={'social-networks'}/>,
            },
          ].map((offer, index) => (
            <div
              key={index}
              className="section__item relative text-center transition-transform transform hover:scale-105 w-60 h-30 group hover:min-w-[300px] hover:min-h-[500px]"
              data-aos="fade-up"
              data-aos-delay={offer.delay}
              data-aos-duration="1500"
            >
              {/* Forma superior e inferior */}
              <div className="shape-top absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 opacity-0 invisible transition-opacity group-hover:opacity-100 group-hover:visible">
                <Image src={Five} alt="shape-top" priority />
              </div>
              <div className="shape-bottom absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2 opacity-0 invisible transition-opacity group-hover:opacity-100 group-hover:visible">
                <Image src={Six} alt="shape-bottom" priority />
              </div>

              {/* Icono */}
              <div className="section__icon w-14 h-14 bg-offer-gradient rounded-full p-6 transition-transform duration-1000 group-hover:bg-primary group-hover:animate-hoverIcon">
                {offer.icon}
              </div>

              {/* Texto con cambio en hover */}
              <h4 className="text-white transition-all duration-300 group-hover:opacity-0">
                {offer.label}
              </h4>
              <div className="text-white m-5 absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <h4 className="m-5">
                {offer.hoverLabel}
                </h4>
                {offer.component}
                {offer.button}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
