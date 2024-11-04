import Image from 'next/image';
import One from "/public/images/shape/offer-shadow-shape.png";
import Three from "/public/images/shape/offer-bg-shape-right.png";
import Four from "/public/images/icon/section-title.png";

const EmpresaOnline = ({ idioma }) => {

  const contenido = {
    es: {
      title: "La importancia de la presencia online para una empresa",
      subtitle:"Por que invertir en presencia online",
      parraf1: "En la era digital actual, es esencial que tu empresa tenga una presencia online. Esto puede ser a través de un sitio web, una plataforma de comercio electrónico, una página de redes sociales o una combinación de todas estas. Tener una presencia online te da una ventaja competitiva, facilita que tus clientes potenciales te encuentren y te permite mostrar tus productos o servicios de manera eficaz.",
      parraf2: "Además, las redes sociales son una herramienta poderosa para construir relaciones con los clientes y clientes potenciales. Te permiten interactuar con tu público objetivo a un nivel más personal y conocer realmente a tus clientes. Las publicaciones diarias en las redes sociales ayudan a familiarizar a los clientes potenciales con tu marca, construir confianza y aumentar el reconocimiento de la marca.",
      parraf3: "Finalmente, los sitios web y las plataformas de redes sociales son excelentes herramientas de marketing. Te permiten superar las barreras de la distancia y llegar a personas que se encuentran a miles de kilómetros de distancia. El marketing online es extremadamente importante para todas las empresas porque tiene una gran influencia en la forma en que los consumidores toman decisiones de compra.",
      parraf4: "En resumen, la presencia online y el uso de las redes sociales son inversiones cruciales para cualquier empresa moderna. Los beneficios son infinitos y pueden tener un impacto significativo en el éxito de tu negocio. ¡No te quedes atrás en la era digital!",
    },
    en: {
      title: "The Importance of Online Presence for a Business",
      subtitle:"Why invest in online presence",
      parraf1: "In today's digital age, it is essential for your business to have an online presence. This can be through a website, an e-commerce platform, a social media page, or a combination of all these. Having an online presence gives you a competitive advantage, makes it easier for potential customers to find you, and allows you to showcase your products or services effectively.",
      parraf2: "Additionally, social media is a powerful tool for building relationships with customers and potential customers. It allows you to interact with your target audience on a more personal level and really get to know your customers. Daily social media posts help familiarize potential customers with your brand, build trust, and increase brand recognition.",
      parraf3: "Finally, websites and social media platforms are excellent marketing tools. They allow you to overcome distance barriers and reach people who are thousands of miles away. Online marketing is extremely important for all businesses because it has a significant influence on how consumers make purchasing decisions.",
      parraf4: "In summary, online presence and the use of social media are crucial investments for any modern business. The benefits are endless and can have a significant impact on the success of your business. Don't get left behind in the digital age!",
    },
    it: {
      title: "L'importanza della presenza online per un'azienda",
      subtitle:"Perché investire nella presenza online",
      parraf1: "Nell'era digitale odierna, è essenziale che la tua azienda abbia una presenza online. Questo può avvenire attraverso un sito web, una piattaforma di e-commerce, una pagina sui social media o una combinazione di tutti questi. Avere una presenza online ti dà un vantaggio competitivo, facilita il ritrovamento da parte dei potenziali clienti e ti consente di mostrare i tuoi prodotti o servizi in modo efficace.",
      parraf2: "Inoltre, i social media sono uno strumento potente per costruire relazioni con i clienti e i potenziali clienti. Ti permettono di interagire con il tuo pubblico di riferimento a un livello più personale e di conoscere davvero i tuoi clienti. I post quotidiani sui social media aiutano a familiarizzare i potenziali clienti con il tuo marchio, a costruire fiducia e ad aumentare il riconoscimento del marchio.",
      parraf3: "Infine, i siti web e le piattaforme di social media sono eccellenti strumenti di marketing. Ti permettono di superare le barriere della distanza e di raggiungere persone che si trovano a migliaia di chilometri di distanza. Il marketing online è estremamente importante per tutte le aziende perché ha una grande influenza sul modo in cui i consumatori prendono decisioni di acquisto.",
      parraf4: "In sintesi, la presenza online e l'uso dei social media sono investimenti cruciali per qualsiasi azienda moderna. I benefici sono infiniti e possono avere un impatto significativo sul successo della tua attività. Non rimanere indietro nell'era digitale!",
    }
  };

  const { title, subtitle, parraf1, parraf2, parraf3, parraf4} = contenido[idioma];

  return (
    <section className="section-area bg-gray-900 pt-32 pb-32">
      {/* Sombras y formas */}
      <div className="section__shape-left" data-aos="fade-left" data-aos-delay="0" data-aos-duration="1500">
        <Image className="animate-swayY" src={One} alt="Shape Left" priority />
      </div>
      <div className="section__shape-right" data-aos="zoom-in-down" data-aos-delay="400" data-aos-duration="1500">
        <Image src={Three} alt="shape" priority />
      </div>

      {/* Contenido principal */}
      <div className="section__container">
        <div className="section-header text-primary mb-16">
          <h2 className="uppercase font-medium flex items-center" data-aos="fade-left" data-aos-delay="0" data-aos-duration="1500">
            <Image className="mr-2" src={Four} alt="icon" priority />
            {subtitle}
          </h2>
          <h3 className="text-white capitalize text-xl" data-aos="fade-up" data-aos-delay="200" data-aos-duration="1500">
            {title}
          </h3>

          {/* Texto de párrafos */}
          <div data-aos="fade-up" className="text-white">
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

export default EmpresaOnline;


