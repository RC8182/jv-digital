import Image from "next/image";
import One from "/public/images/shape/offer-shadow-shape.png";
import Two from "/public/images/shape/offer-bg-shape-left.png";
import Three from "/public/images/shape/offer-bg-shape-right.png";
import Four from "/public/images/icon/section-title.png";
import Five from "/public/images/shape/offter-item-shape-top.png";
import Six from "/public/images/shape/offter-item-shape-bottom.png";

// Importamos iconos de React Icons
import { FaFacebookF, FaInstagram, FaTripadvisor, FaGoogle, FaGlobe, FaIdCard } from 'react-icons/fa'; 
import DeviceFrame from "./deviseIfram/deviseIframe";

const Solutions = ({ idioma }) => {
  const contenido = {
    es: {
      title: "Impulsa el Progreso con las Últimas Tendencias Tecnológicas",
      subtitle: "Soluciones",
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
          label: "Facebook",
          hoverLabel: "Gestionamos tu Facebook",
        },
        instagram: {
          label: "Instagram",
          hoverLabel: "Mejoramos tu Instagram",
        },
        google: {
          label: "Google My Business",
          hoverLabel: "Optimiza tu perfil de Google",
        },
        trip: {
          label: "Trip Advisor",
          hoverLabel: "Impulsamos tu negocio",
        },
      },
    },
    en: {
      title: "Drive Progress with the Latest Technology Trends",
      subtitle: "Solutions",
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
          label: "Facebook",
          hoverLabel: "We manage your Facebook",
        },
        instagram: {
          label: "Instagram",
          hoverLabel: "We enhance your Instagram",
        },
        google: {
          label: "Google My Business",
          hoverLabel: "Optimize your Google profile",
        },
        trip: {
          label: "Trip Advisor",
          hoverLabel: "We boost your business",
        },
      },
    },
    it: {
      title: "Promuovi il Progresso con le Ultime Tendenze Tecnologiche",
      subtitle: "Soluzioni",
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
          label: "Facebook",
          hoverLabel: "Gestiamo il tuo Facebook",
        },
        instagram: {
          label: "Instagram",
          hoverLabel: "Miglioriamo il tuo Instagram",
        },
        google: {
          label: "Google My Business",
          hoverLabel: "Ottimizza il tuo profilo Google",
        },
        trip: {
          label: "Trip Advisor",
          hoverLabel: "Promuoviamo il tuo business",
        },
      },
    },
  };

  const { title, subtitle, solutions } = contenido[idioma];

  return (
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
      <div className="section__container">
        <div className="section-header text-primary mb-16">
          <h2 className="uppercase font-medium flex items-center" data-aos="fade-left" data-aos-duration="1500">
            <Image className="mr-2" src={Four} alt="icon" priority />
            {subtitle}
          </h2>
          <h3 className="text-white capitalize" data-aos="fade-left" data-aos-delay="200" data-aos-duration="1500">
            {title}
          </h3>
        </div>

        {/* Ofertas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {[
            {
              icon: <FaGlobe size={36} color="#3C72FC" />,
              label: solutions.website.label,
              hoverLabel: solutions.website.hoverLabel,
              delay: 0,
            },
            {
              icon: <FaIdCard size={36} color="#3C72FC" />,
              label: solutions.cards.label,
              hoverLabel: solutions.cards.hoverLabel,
              delay: 0,
            },
            {
              icon: <FaFacebookF size={36} color="#3C72FC" />,
              label: solutions.facebook.label,
              hoverLabel: solutions.facebook.hoverLabel,
              delay: 100,
            },
            {
              icon: <FaInstagram size={36} color="#3C72FC" />,
              label: solutions.instagram.label,
              hoverLabel: solutions.instagram.hoverLabel,
              delay: 200,
            },
            {
              icon: <FaTripadvisor size={36} color="#3C72FC" />,
              label: solutions.trip.label,
              hoverLabel: solutions.trip.hoverLabel,
              delay: 300,
            },
            {
              icon: <FaGoogle size={36} color="#3C72FC" />,
              label: solutions.google.label,
              hoverLabel: solutions.google.hoverLabel,
              delay: 500,
            },
          ].map((offer, index) => (
            <div
              key={index}
              className="section__item relative text-center transition-transform transform hover:scale-105 group"
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
              <h4 className="text-white mt-5 transition-all duration-300 group-hover:opacity-0">
                {offer.label}
              </h4>
              <h4 className="text-white mt-5 absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                {offer.hoverLabel}
              </h4>
            </div>
          ))}
        </div>
        <DeviceFrame src="https://jv-digital.com/es/vp/fabrizio" device="mobile" />
        <DeviceFrame src="https://jv-digital.com/es/vp/fabrizio"  />
      </div>
    </section>
  );
};

export default Solutions;
