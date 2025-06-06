import Image from "next/image";
import One from "/public/images/shape/offer-shadow-shape.png";
import Three from "/public/images/shape/pricing-shape.png";
import Four from "/public/images/icon/section-title.png";


const About = ({ idioma }) => {


  const contenido = {
    es: {
      title: "Sobre Nosotros",
      subtitle:"JV-Digital",
      parraf1: "En JV Digital, nos especializamos en el diseño y desarrollo de aplicaciones y sitios web modernos y responsivos utilizando tecnologías avanzadas como Next.js, HTML5, CSS3 y JavaScript. Cada proyecto que emprendemos está optimizado para ofrecer un rendimiento excelente y una experiencia de usuario intuitiva.",
      parraf2: "Además, gestionamos perfiles sociales y desarrollamos estrategias de contenido y campañas de marketing en plataformas como Facebook, Instagram, LinkedIn y Twitter. Nuestro objetivo es ayudar a las empresas a conectar con su audiencia y aumentar su visibilidad y engagement.",
      parraf3: "Implementamos estrategias de SEO y SEM para mejorar el posicionamiento en motores de búsqueda y atraer más tráfico orgánico y pagado a los sitios web de nuestros clientes.",
      parraf4: "Si estás buscando un socio de confianza para llevar tu presencia digital al siguiente nivel, ¡no dudes en ponerte en contacto con nosotros!"
    },
    it: {
      title: "Chi Siamo",
      subtitle:"JV-Digital",
      parraf1: "In JV Digital, siamo specializzati nella progettazione e sviluppo di applicazioni e siti web moderni e reattivi utilizzando tecnologie avanzate come Next.js, HTML5, CSS3 e JavaScript. Ogni progetto che intraprendiamo è ottimizzato per offrire prestazioni eccellenti e un'esperienza utente intuitiva.",
      parraf2: "Inoltre, gestiamo profili social e sviluppiamo strategie di contenuto e campagne di marketing su piattaforme come Facebook, Instagram, LinkedIn e Twitter. Il nostro obiettivo è aiutare le aziende a connettersi con il loro pubblico e aumentare la loro visibilità e coinvolgimento.",
      parraf3: "Implementiamo strategie di SEO e SEM per migliorare il posizionamento nei motori di ricerca e attirare più traffico organico e a pagamento ai siti web dei nostri clienti.",
      parraf4: "Se stai cercando un partner di fiducia per portare la tua presenza digitale al livello successivo, non esitare a contattarci!"
    },
    en: {
      title: "About Us",
      subtitle:"JV-Digital",
      parraf1: "At JV Digital, we specialize in designing and developing modern and responsive applications and websites using advanced technologies such as Next.js, HTML5, CSS3, and JavaScript. Every project we undertake is optimized to deliver excellent performance and an intuitive user experience.",
      parraf2: "Additionally, we manage social profiles and develop content strategies and marketing campaigns on platforms like Facebook, Instagram, LinkedIn, and Twitter. Our goal is to help businesses connect with their audience and increase their visibility and engagement.",
      parraf3: "We implement SEO and SEM strategies to improve search engine rankings and attract more organic and paid traffic to our clients' websites.",
      parraf4: "If you're looking for a trusted partner to take your digital presence to the next level, don't hesitate to get in touch with us!"
    }
  };

  const { title, subtitle, parraf1, parraf2, parraf3, parraf4 } = contenido[idioma];

  return (
    <section className="section-area bg-gray-900 pt-32 pb-32" id="about-three">
      {/* Formas superiores con animación de sombra */}
       <div
        className="section__shape-right hidden sm:block animate-swayY"
        data-aos="fade-left"
        data-aos-delay="0"
        data-aos-duration="1500"
      >
        <Image src={Three} alt="Shape Left" priority />
      </div>
      <div className="section__shape-left" data-aos="fade-left" data-aos-delay="0" data-aos-duration="1500">
        <Image className="animate-swayY" src={One} alt="Shape Left" priority />
      </div>

   {/* Contenedor principal */}
    <div className="section__container">
        <div className="section-header mb-24 text-primary text-xl">
          <h2
            className="uppercase font-medium flex items-center"
            id="about"
          >
            <Image className="mr-2" src={Four} alt="icon" priority />
            {subtitle}
          </h2>
          <h3
            className="text-white text-3xl capitalize"
          >
            {title}
          </h3>
          {/* Texto de párrafos */}
          <div className="text-white mt-8 text-xl">
            <p className="mb-4">{parraf1}</p>
            <p className="mb-4">{parraf2}</p>
            <p className="mb-4">{parraf3}</p>
            <p className="font-semibold">{parraf4}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

