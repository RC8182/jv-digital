import './footer.css';
import Link from "next/link";
import Image from "next/image";
import One from "/public/images/shape/footer-regular-left.png";
import Two from "/public/images/shape/footer-solid-left.png";
import Three from "/public/images/shape/footer-regular-right.png";
import Four from "/public/images/shape/footer-solid-right.png";
import Five from "/public/images/shape/footer-shadow-shape.png";
import Logo from '/public/photos/icons/jv-digital-rm-bg.png';
import { FaFacebookF, FaInstagram, FaClock, FaPhone } from "react-icons/fa";
import { BiLogoLinkedin } from "react-icons/bi";

const Footer = ({ idioma }) => {
  const contenido = {
    es: {
      contactInfo: "INFORMACIÓN DE CONTACTO",
      ourClients: "Nuestros Clientes",
      solutions: {
        title: "Servicios",
        list: ['Presencia Online', 'SEO', 'Creación y Gestión de Páginas Web', 'Gestión de Redes Sociales', 'Alojamiento Web']
      },
      schedule: {
        title: 'Horario: ',
        info: 'Lun - Sab: 10:00 AM - 4:00 PM'
      },
      email: "info.jv.digital@gmail.com",
      phone: 'Teléfono',
      slogan: "Transformamos Ideas en Presencia Digital",
      clients: [
        { name: "Azul Kiteboarding", url: "https://www.azulkiteboarding.com/es/" },
        { name: "Arena Negra Restaurante", url: "https://arena-negra-restaurant.com/es" },
        { name: "La Niña Restaurante", url: "https://la-nina-restaurante.com/" },
        { name: "La Cañita Cocktail Bar", url: "https://arena-negra-restaurant.com/es/la-canita" },
        { name: "La Paella Restaurante", url: "https://la-paella-restaurante.com/es" },
        { name: "Tenerife Kite Foil", url: "https://tenerife-kite-foil.com/es" }
      ],
      terms: {
        title: 'Términos y Condiciones',
        href: '/'
      },
      policy: {
        title: 'Política de Privacidad',
        href: '/'
      }
    },
    en: {
      contactInfo: "CONTACT INFO",
      ourClients: "Our Clients",
      solutions: {
        title: "Services",
        list: ['Online Presence', 'SEO', 'Website Creation and Management', 'Social Media Management', 'Web Hosting']
      },
      schedule: {
        title: 'Schedule: ',
        info: 'Mon - Sat: 10:00 AM - 4:00 PM'
      },
      email: "info.jv.digital@gmail.com",
      phone: 'Phone',
      slogan: "We Transform Ideas into Digital Presence",
      clients: [
        { name: "Azul Kiteboarding", url: "https://www.azulkiteboarding.com/en/" },
        { name: "Arena Negra Restaurant", url: "https://arena-negra-restaurant.com/en" },
        { name: "La Niña Restaurant", url: "https://la-nina-restaurante.com/" },
        { name: "La Cañita Cocktail Bar", url: "https://arena-negra-restaurant.com/en/la-canita" },
        { name: "La Paella Restaurant", url: "https://la-paella-restaurante.com/" },
        { name: "Tenerife Kite Foil", url: "https://tenerife-kite-foil.com/" }
      ],
      terms: {
        title: 'Terms and Conditions',
        href: '/'
      },
      policy: {
        title: 'Privacy Policy',
        href: '/'
      }
    },
    it: {
      contactInfo: "INFORMAZIONI DI CONTATTO",
      ourClients: "I Nostri Clienti",
      solutions: {
        title: "Servizi",
        list: ['Presenza Online', 'SEO', 'Creazione e Gestione di Pagine Web', 'Gestione dei Social Media', 'Hosting Web']
      },
      schedule: {
        title: 'Orario: ',
        info: 'Lun - Sab: 10:00 AM - 4:00 PM'
      },
      email: "info.jv.digital@gmail.com",
      phone: 'Telefono',
      slogan: "Trasformiamo Idee in Presenza Digitale",
      clients: [
        { name: "Azul Kiteboarding", url: "https://www.azulkiteboarding.com/it/" },
        { name: "Arena Negra Ristorante", url: "https://arena-negra-restaurant.com/it" },
        { name: "La Niña Ristorante", url: "https://la-nina-ristorante.com/" },
        { name: "La Cañita Cocktail Bar", url: "https://arena-negra-restaurant.com/it/la-canita" },
        { name: "La Paella Ristorante", url: "https://la-paella-ristorante.com/" },
        { name: "Tenerife Kite Foil", url: "https://tenerife-kite-foil.com/it" }
      ],
      terms: {
        title: 'Termini e Condizioni',
        href: '/'
      },
      policy: {
        title: 'Politica sulla Privacy',
        href: '/'
      }
    }
  };

  const { contactInfo, ourClients, email, clients, slogan, solutions, schedule, terms, policy, phone } = contenido[idioma] || contenido['es'];

  return (
    <footer className="relative footer-area bg-secondary overflow-hidden">
      {/* Formas del footer */}
      <div
        className="absolute top-0 left-0"
        data-aos="fade-left"
        data-aos-delay="0"
        data-aos-duration="1500"
      >
        <Image src={One} alt="shape" priority />
      </div>
      <div
        className="absolute top-0 left-0"
        data-aos="fade-left"
        data-aos-delay="200"
        data-aos-duration="1500"
      >
        <Image className="animate-swayY" src={Two} alt="shape" priority />
      </div>
      <div
        className="absolute top-0 right-0"
        data-aos="fade-right"
        data-aos-delay="0"
        data-aos-duration="1500"
      >
        <Image className="animate-swayY" src={Three} alt="shape" priority />
      </div>
      <div
        className="absolute top-0 right-0"
        data-aos="fade-right"
        data-aos-delay="200"
        data-aos-duration="1500"
      >
        <Image src={Four} alt="shape" priority />
      </div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 animate-swayY">
        <Image src={Five} alt="shadow" priority />
      </div>

      {/* Contenido del footer */}
      <div className="container mx-auto px-4 py-24">
        <div className="flex flex-wrap justify-between gap-8">
          {/* Item principal */}
          <div
            className="footer__item w-full lg:w-1/4 text-white"
            data-aos="fade-up"
            data-aos-delay="0"
            data-aos-duration="1500"
          >
            <Link href="/" className="block mb-4">
              {/* Ajuste de tamaño del logo */}
              <Image src={Logo} alt="Logo" width={150} height={75} priority />
            </Link>
            <p className="text-3xl">{slogan}</p>
            <div className="mt-6">
              <ul className="flex space-x-4">
                <li>
                  <Link href="https://www.facebook.com/profile.php?id=61560950767368" aria-label="Facebook">
                    <FaFacebookF className="text-white text-opacity-75 hover:text-primary transition" />
                  </Link>
                </li>
                <li>
                  <Link href="https://www.instagram.com/jvdigital81" aria-label="Instagram">
                    <FaInstagram className="text-white text-opacity-75 hover:text-primary transition" />
                  </Link>
                </li>
                <li>
                  <Link href="https://www.linkedin.com/company/103650480/admin/inbox/" aria-label="LinkedIn">
                    <BiLogoLinkedin className="text-white text-opacity-75 hover:text-primary transition" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Soluciones */}
          <div
            className="footer__item w-full lg:w-1/6"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="1500"
          >
            <h3 className="text-white mb-4">{solutions.title}</h3>
            <ul>
              {solutions.list.map((service, index) => (
                <li key={index} className="text-white text-opacity-80 hover:text-primary transition mb-2">
                  <i className="fa-solid fa-angles-right mr-2"></i>
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Clientes */}
          <div
            className="footer__item w-full lg:w-1/6"
            data-aos="fade-up"
            data-aos-delay="400"
            data-aos-duration="1500"
          >
            <h3 className="text-white mb-4">{ourClients}</h3>
            <ul>
              {clients.map(client => (
                <li key={client.name} className="text-white text-opacity-80 hover:text-primary transition mb-2">
                  <Link href={client.url}>
                    <i className="fa-solid fa-angles-right mr-2"></i>
                    {client.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div
            className="footer__item w-full lg:w-1/4 text-white"
            data-aos="fade-up"
            data-aos-delay="600"
            data-aos-duration="1500"
          >
            <h3 className="text-white mb-4">{contactInfo}</h3>
            <p className="text-white text-opacity-80 mb-6">{email}</p>
            <ul className="footer-contact space-y-4">
              <li className="flex items-center gap-4">
                <FaClock className="text-2xl" />
                <div>
                  <h5 className="text-white">{schedule.title}</h5>
                  <p className="text-white text-opacity-80">{schedule.info}</p>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <FaPhone className="text-2xl" />
                <div>
                  <h5 className="text-white">{phone}</h5>
                  <p className="text-white text-opacity-80">+34 648 416 513, +39 327 243 5490</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer__copyright border-t border-white/20 py-6">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-4 text-white">
          <p className="">
            &copy; 2024 <Link href="/">JV-Digital</Link>. All Rights Reserved.
          </p>
          <ul className="flex space-x-4">
            <li>
              <Link href={terms.href} className="text-white text-opacity-80">
                {terms.title}
              </Link>
            </li>
            <li>
              <Link href={policy.href} className="text-white text-opacity-80">
                {policy.title}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
