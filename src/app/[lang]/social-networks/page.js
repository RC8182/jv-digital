import Image from "next/image";
import One from "/public/images/shape/offer-shadow-shape.png";
import Two from "/public/images/shape/offer-bg-shape-left.png";
import Three from "/public/images/shape/offer-bg-shape-right.png";
import Four from "/public/images/icon/section-title.png";
import CmnBanner from "@/components/cmnBanner";
import Navbar from "@/components/Navbar/Navbar";
import ScrollProgressButton from "@/components/ScrollProgressButton";
import Footer from "@/components/Footer/footer";


const SocialNetworks = ({params}) => {
  const idioma= params.lang || 'es';
  const contenido = {
    es: {
      title: "Impulsa la Interacción con tus Clientes",
      subtitle: "Redes Sociales",
      parrafo:[`En la era digital, tener una presencia activa en redes sociales es fundamental para conectar con nuestros clientes y construir una comunidad sólida. En nuestras plataformas de Facebook e Instagram, publicamos de dos a tres posts semanales, donde compartimos contenido fresco y atractivo. Utilizamos fotos que tomamos nosotros mismos, pero también te invitamos a que nos envíes tus imágenes para que las subamos y así mostrar la experiencia de nuestros clientes desde diferentes perspectivas.

      Además, gestionamos nuestras cuentas de Google My Business y TripAdvisor con el mismo compromiso. Respondemos a las reseñas de nuestros clientes, ya sean positivas o constructivas, porque valoramos cada opinión y creemos que la comunicación es clave para mejorar y crecer.

      Nuestro objetivo es crear un espacio donde todos se sientan escuchados y valorados. ¡Síguenos y sé parte de nuestra comunidad!`,
      
      `Ofrecemos como regalo un dispositivo NFC, para que tus clientes puedan dejarte reseñas e interactuar fácilmente con tu negocio.
        Con solo acercar su teléfono, podrán acceder a un enlace donde podrán compartir sus experiencias, dejar comentarios y conocer más sobre tus productos o servicios.
        Es una forma sencilla y moderna de fomentar la comunicación y mejorar la relación con tus clientes.
        ¡Aprovecha esta oportunidad para fortalecer tu presencia y reputación en el mercado!`,
      ] 
    },
    en: {
      title: "Boost Customer Engagement",
      subtitle: "Social Media",
      parrafo: [`In the digital age, having an active presence on social media is essential for connecting with our customers and building a strong community. On our Facebook and Instagram platforms, we post two to three times a week, sharing fresh and engaging content. We use photos that we take ourselves, but we also invite you to send us your images so we can share them and showcase our customers' experiences from different perspectives.
      Additionally, we manage our Google My Business and TripAdvisor accounts with the same commitment. We respond to our customers' reviews, whether they are positive or constructive, because we value every opinion and believe that communication is key to improving and growing.
      Our goal is to create a space where everyone feels heard and valued. Follow us and be part of our community!`

        ,`We offer a complimentary NFC device so your customers can leave reviews and easily interact with your business.
        By simply tapping their phone, they can access a link to share their experiences, leave feedback, and learn more about your products or services.
        It's a simple and modern way to encourage communication and enhance your relationship with customers.
        Take advantage of this opportunity to strengthen your presence and reputation in the market!`]
    },
    it: {
      title: "Incentiva l'Interazione con i Clienti",
      subtitle: "Social Media",
      parrafo:[`Nell'era digitale, avere una presenza attiva sui social media è fondamentale per connettersi con i nostri clienti e costruire una comunità solida. Sulle nostre piattaforme di Facebook e Instagram, pubblichiamo da due a tre post a settimana, condividendo contenuti freschi e coinvolgenti. Utilizziamo foto che scattiamo noi stessi, ma ti invitiamo anche a inviarci le tue immagini in modo da poterle pubblicare e mostrare l'esperienza dei nostri clienti da diverse prospettive.
      Inoltre, gestiamo i nostri account di Google My Business e TripAdvisor con lo stesso impegno. Rispondiamo alle recensioni dei nostri clienti, siano esse positive o costruttive, perché valorizziamo ogni opinione e crediamo che la comunicazione sia fondamentale per migliorare e crescere.
      Il nostro obiettivo è creare uno spazio in cui tutti si sentano ascoltati e apprezzati. Seguici e diventa parte della nostra comunità!
      `,`Offriamo in omaggio un dispositivo NFC, affinché i tuoi clienti possano lasciarti recensioni e interagire facilmente con la tua attività.
        Basta avvicinare il loro telefono per accedere a un link dove possono condividere le loro esperienze, lasciare commenti e scoprire di più sui tuoi prodotti o servizi.
        È un modo semplice e moderno per promuovere la comunicazione e migliorare il rapporto con i tuoi clienti.
        Approfitta di questa opportunità per rafforzare la tua presenza e reputazione sul mercato!`] 
    },
  };
  

  const { title, subtitle, parrafo } = contenido[idioma];
  return (
    <>
    <Navbar idioma={idioma}/>
    <ScrollProgressButton/>
    <CmnBanner title={'Social Networks'}/>
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
            <h3 className="text-white capitalize text-6xl">
              {title}
            </h3>
            {parrafo.map((texto, index) => (
              <p key={index} className="text-white mb-4">
                {texto}
              </p>
            ))}
          </div>
          <div className="flex justify-center">
            <Image className="mr-2" src={'/photos/services/3.png'} width={500} height={500} alt="icon" priority />
          </div>
          
        <div className="section__container flex flex-wrap gap-8">

        </div>

      </div>
    </section>
    <Footer idioma={idioma}/>
    </>

  );
};

export default SocialNetworks;
