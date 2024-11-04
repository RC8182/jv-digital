import Image from "next/image";
import One from "/public/images/shape/offer-shadow-shape.png";
import Two from "/public/images/shape/offer-bg-shape-left.png";
import Three from "/public/images/shape/offer-bg-shape-right.png";
import Four from "/public/images/icon/section-title.png";
import DeviceFrame from "@/components/deviseIfram/deviseIframe";
import CmnBanner from "@/components/cmnBanner";

const Websites = ({ params }) => {
  const idioma = params.lang || 'es';
  const contenido = {
    es: {
      title: "Diseño y Gestión de Páginas Web",
      subtitle: "Páginas Web",
      parrafo: [
        "En JV-Digital, ofrecemos soluciones integrales para el diseño y gestión de páginas web, utilizando tecnologías de vanguardia como Next.js y WordPress.",
        "Nos especializamos en crear sitios web atractivos, rápidos y optimizados para el usuario.",
        "Nuestros Servicios:",
        "1. Desarrollo Web con Next.js: Creamos aplicaciones web escalables y eficientes, aprovechando la velocidad y el rendimiento que Next.js ofrece.",
        "2. Gestión de Contenidos con WordPress: Implementamos WordPress para que puedas gestionar tu contenido de forma sencilla y efectiva.",
        "3. SEO y Investigación de Palabras Clave: Realizamos un análisis exhaustivo para identificar las palabras clave más relevantes para tu negocio.",
        "4. SEO On-Page: Optimización de cada página de tu sitio para maximizar visibilidad.",
        "5. Link Building: Construcción de enlaces para aumentar la autoridad de tu sitio.",
        "6. Analítica y Monitoreo: Herramientas para rastrear rendimiento y ajustar estrategias.",
        "7. Alojamiento Web: Soluciones confiables y seguras para asegurar la disponibilidad del sitio.",
        "En JV_Digital, estamos comprometidos a ayudarte a alcanzar tus objetivos en línea. ¡Contáctanos para llevar tu presencia digital al siguiente nivel!"
      ]
    },
    en: {
      title: "Web Design and Management",
      subtitle: "Web Pages",
      parrafo: [
        "At JV-Digital, we offer comprehensive solutions for web design and management, using cutting-edge technologies like Next.js and WordPress.",
        "We specialize in creating attractive, fast, and user-optimized websites.",
        "Our Services:",
        "1. Web Development with Next.js: Scalable and efficient web applications.",
        "2. Content Management with WordPress: Simplified content management with customized templates.",
        "3. SEO and Keyword Research: In-depth keyword analysis for better traffic.",
        "4. On-Page SEO: Optimization of each page to maximize visibility.",
        "5. Link Building: Strategies to improve site ranking and authority.",
        "6. Analytics and Monitoring: Data-driven adjustments and strategy improvements.",
        "7. Web Hosting: Reliable and secure hosting solutions.",
        "At JV-Digital, we are committed to helping you achieve your online goals. Contact us to elevate your digital presence to the next level!"
      ]
    },
    it: {
      title: "Design e Gestione di Siti Web",
      subtitle: "Siti Web",
      parrafo: [
        "In JV-Digital, offriamo soluzioni integrate per il design e la gestione di siti web, utilizzando tecnologie all'avanguardia come Next.js e WordPress.",
        "Siamo specializzati nella creazione di siti web attraenti, veloci e ottimizzati per l'utente.",
        "I Nostri Servizi:",
        "1. Sviluppo Web con Next.js: Applicazioni web scalabili ed efficienti.",
        "2. Gestione dei Contenuti con WordPress: Contenuti facili da gestire con modelli personalizzati.",
        "3. SEO e Ricerca di Parole Chiave: Analisi delle parole chiave più rilevanti.",
        "4. SEO On-Page: Ottimizzazione di ogni pagina per visibilità.",
        "5. Link Building: Strategia di costruzione di link per migliorare il posizionamento.",
        "6. Analisi e Monitoraggio: Strumenti per monitorare le prestazioni e migliorare la strategia.",
        "7. Hosting Web: Soluzioni di hosting affidabili e sicure.",
        "In JV-Digital, siamo impegnati ad aiutarti a raggiungere i tuoi obiettivi online. Contattaci per portare la tua presenza digitale al livello successivo!"
      ]
    }
  };

  const { title, subtitle, parrafo } = contenido[idioma];

  return (
    <>
      <CmnBanner title={subtitle} />
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
          <div className="section-header text-primary mb-16">
            <h2 className="uppercase font-medium flex items-center" data-aos="fade-left" data-aos-duration="1500">
              <Image className="mr-2" src={Four} alt="icon" priority />
              {subtitle}
            </h2>
            <h3 className="text-white capitalize text-xl" data-aos="fade-left" data-aos-delay="200" data-aos-duration="1500">
              {title}
            </h3>
            {parrafo.map((texto, index) => (
              <p key={index} className="text-white mb-4" data-aos="fade-up" data-aos-delay={`${200 + index * 100}`} data-aos-duration="1500">
                {texto}
              </p>
            ))}
          </div>
          <div className="section__container flex flex-wrap gap-8">
            <DeviceFrame src="https://arena-negra-restaurant.com" device="mobile" />
            <DeviceFrame src="https://la-nina-restaurante.com" device="mobile" />
            <DeviceFrame src="https://la-paella-restaurante.com" device="mobile" />
            <DeviceFrame src="https://www.azulkiteboarding.com/es/" device="mobile" />
          </div>
        </div>
      </section>
    </>
  );
};

export default Websites;
