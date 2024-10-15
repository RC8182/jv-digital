"use client";
import { useState, useEffect } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "../2/style.css";


// import required modules
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaFacebookF, FaStar, FaTripadvisor, FaInstagram, FaGoogle } from "react-icons/fa";
import { BiPhoneCall } from "react-icons/bi";

const PortadaSection = ({ idioma }) => {
  const [isLoading, setIsLoading] = useState(true);
  const tel = "+34 648 416 513";
  const contenido = {
    es: {
      slider1: {
        title: "Lleva tu negocio al siguiente nivel",
        subtitle: "Con JV-DIGITAL",
        description: "Expertos en Marketing Digital y Estrategias Empresariales",
      },
      slider2: {
        title: "Conéctate con el mundo",
        subtitle: "A través de Instagram",
      },
      slider3: {
        title: "Impulsa tu presencia",
        subtitle: "En Facebook",
      },
      slider4: {
        title: "Destaca en las reseñas",
        subtitle: "Con Trip Advisor",
      },
      slider5: {
        title: "Optimiza tu negocio",
        subtitle: "En Google My Business",
      },
      spinText1: "JV-Digital",
      spinText2:"Tu Presencia Online",
    },
    en: {
      slider1: {
        title: "Take Your Business to the Next Level",
        subtitle: "With JV-DIGITAL",
        description: "Experts in Digital Marketing and Business Strategies",
      },
      slider2: {
        title: "Connect with the World",
        subtitle: "Through Instagram",
      },
      slider3: {
        title: "Boost Your Presence",
        subtitle: "On Facebook",
      },
      slider4: {
        title: "Shine in Reviews",
        subtitle: "With Trip Advisor",
      },
      slider5: {
        title: "Optimize Your Business",
        subtitle: "On Google My Business",
      },
      spinText1: "JV-Digital",
      spinText2:"La Tua Presenza Digitale",
    },
    it: {
      slider1: {
        title: "Porta la tua attività al livello successivo",
        subtitle: "Con JV-DIGITAL",
        description: "Esperti in Marketing Digitale e Strategie Aziendali",
      },
      slider2: {
        title: "Connettiti con il mondo",
        subtitle: "Attraverso Instagram",
      },
      slider3: {
        title: "Aumenta la tua presenza",
        subtitle: "Su Facebook",
      },
      slider4: {
        title: "Brilla nelle recensioni",
        subtitle: "Con Trip Advisor",
      },
      slider5: {
        title: "Ottimizza la tua attività",
        subtitle: "Su Google My Business",
      },
      spinText1: "JV-Digital",
      spinText2:"La Tua Presenza Online",
    },
  };

  const { slider1, slider2, slider3, slider4, slider5, spinText1, spinText2 } = contenido[idioma];
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Cambia este tiempo según sea necesario
    return () => clearTimeout(timer);
  }, []);


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[700px] bg-blue-900 text-white">
        <div className="mb-4 text-2xl">
          {spinText1}
        </div>
        {/* Logo que gira */}
        <div style={{ animation: 'spin 3s linear infinite' }} className="inline-block w-32 h-32">
          <img src='/photos/icons/jv-digital1.png' alt="Logo" className="w-full h-full rounded-full" />
        </div>
        {/* Texto de cargando */}
        <div className="mt-4 text-xl">
          {spinText2}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-900">
      <Swiper
        centeredSlides={true}
        navigation={true}
        speed={2000}
        autoplay={{
          delay: 2000,
          disableOnInteraction: true,
        }}
        pagination={{ clickable: true }}
        modules={[Navigation, Autoplay, Pagination]}
      >
        {/* Slider 1 */}
        <SwiperSlide>
          <div
            className="bg-[url('/photos/hero/jv-digital-fondo.png')] w-full h-[850px] bg-opacity-40 grid items-center justify-center text-white relative pb-16 bg-cover"
            data-aos="fade-down"
          >
            <div className="text-center">
              <div className="flex justify-center space-x-2 mb-5">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-khaki w-4 h-4" />
                ))}
              </div>
              <h4 className="text-base mb-4">{slider1.description}</h4>
              <div className="mb-8">
                <h1 className="text-4xl font-semibold">{slider1.title}</h1>
                <h1 className="text-4xl font-semibold">{slider1.subtitle}</h1>
              </div>
            </div>
            <div className="absolute left-0 top-1/2 w-[221px] h-[50px] border-white border hidden md:flex items-center justify-center -rotate-90">
              <BiPhoneCall className="mr-2 text-khaki w-5 h-5" /> {tel}
            </div>
          </div>
        </SwiperSlide>
  
        {/* Slider 2 */}
        <SwiperSlide>
          <div className="bg-[url('/photos/hero/jv-digital-fondo.png')] w-full h-[850px] bg-opacity-40 grid items-center justify-center text-white relative pb-16 bg-cover"
            data-aos="fade-down"
          >
            <div className="text-center">
              <div className="flex justify-center mb-5">
                <div className="w-44 h-44 rounded-full border border-lightGray grid items-center justify-center hover:border-khaki">
                  <FaInstagram className="text-lightGray w-32 h-32" />
                </div>
              </div>
              <div className="mb-8">
                <h1 className="text-4xl font-semibold">{slider2.title}</h1>
                <h2 className="text-3xl font-medium">{slider2.subtitle}</h2>
              </div>
            </div>
          </div>
        </SwiperSlide>
  
        {/* Slider 3 */}
        <SwiperSlide>
          <div className="bg-[url('/photos/hero/jv-digital-fondo.png')] w-full h-[850px] bg-opacity-40 grid items-center justify-center text-white relative pb-16 bg-cover"
            data-aos="fade-down"
          >
            <div className="text-center">
              <div className="flex justify-center mb-5">
                <div className="w-44 h-44 rounded-full border border-lightGray grid items-center justify-center hover:border-khaki">
                  <FaFacebookF className="text-lightGray w-32 h-32" />
                </div>
              </div>
              <div className="mb-8">
                <h1 className="text-4xl font-semibold">{slider3.title}</h1>
                <h2 className="text-3xl font-medium">{slider3.subtitle}</h2>
              </div>
            </div>
          </div>
        </SwiperSlide>
  
        {/* Slider 4 */}
        <SwiperSlide>
          <div className="bg-[url('/photos/hero/jv-digital-fondo.png')] w-full h-[850px] bg-opacity-40 grid items-center justify-center text-white relative pb-16 bg-cover"
            data-aos="fade-down"
          >
            <div className="text-center">
              <div className="flex justify-center mb-5">
                <div className="w-44 h-44 rounded-full border border-lightGray grid items-center justify-center hover:border-khaki">
                  <FaTripadvisor className="text-lightGray w-32 h-32" />
                </div>
              </div>
              <div className="mb-8">
                <h1 className="text-4xl font-semibold">{slider4.title}</h1>
                <h2 className="text-3xl font-medium">{slider4.subtitle}</h2>
              </div>
            </div>
          </div>
        </SwiperSlide>
  
        {/* Slider 5 */}
        <SwiperSlide>
          <div className="bg-[url('/photos/hero/jv-digital-fondo.png')] w-full h-[850px] bg-opacity-40 grid items-center justify-center text-white relative pb-16 bg-cover"
            data-aos="fade-down"
          >
            <div className="text-center">
              <div className="flex justify-center mb-5">
                <div className="w-44 h-44 rounded-full border border-lightGray grid items-center justify-center hover:border-khaki">
                  <FaGoogle className="text-lightGray w-32 h-32" />
                </div>
              </div>
              <div className="mb-8">
                <h1 className="text-4xl font-semibold">{slider5.title}</h1>
                <h2 className="text-3xl font-medium">{slider5.subtitle}</h2>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
  
};

export default PortadaSection;