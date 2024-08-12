'use client'
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "./style.css";

// import required modules
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaFacebookF, FaStar, FaTripadvisor, FaInstagram, FaGoogle } from "react-icons/fa";
import { BiPhoneCall } from "react-icons/bi";

const HeroSection = ({ idioma }) => {
  const tel = '+34 648 416 513';

  const contenido = {
    es: {
      slider1: {
        title: "Lleva tu negocio al siguiente nivel",
        subtitle: "Con JV-DIGITAL",
        description: "Expertos en Marketing Digital y Estrategias Empresariales"
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
      }
    },
    en: {
      slider1: {
        title: "Take Your Business to the Next Level",
        subtitle: "With JV-DIGITAL",
        description: "Experts in Digital Marketing and Business Strategies"
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
    },
    it: {
      slider1: {
        title: "Porta la tua attività al livello successivo",
        subtitle: "Con JV-DIGITAL",
        description: "Esperti in Marketing Digitale e Strategie Aziendali"
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
    }
  };

  const { slider1, slider2, slider3, slider4, slider5 } = contenido[idioma];

  return (
    <div className="">
      <Swiper
        centeredSlides={true}
        navigation={true}
        speed="3000"
        autoplay={{
          delay: 10000,
          disableOnInteraction: true,
        }}
        pagination={{
          clickable: true,
        }}
        modules={[Navigation, Autoplay, Pagination]}
        className="mySwiper"
      >
        {/* slider 1 */}
        <SwiperSlide>
          <div
            className="bg-[url('/photos/hero/jv-digital-fondo.png')] w-full h-[700px] md:h-[800px] xl:h-[850px] 3xl:h-[950px] bg-[rgba(30,30,30,0.4)] bg-opacity-40 grid items-center bg-cover justify-center text-white relative pb-[150px] lg:pb-16 xl:pb-0"
            data-aos="fade-down"
          >
            <div className="font-Garamond 2xl:w-[720px] text-center">
              <div className="flex space-x-2 items-center justify-center mb-5 lg:mb-6">
                <FaStar className="w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-khaki" />
                <FaStar className="w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-khaki" />
                <FaStar className="w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-khaki" />
                <FaStar className="w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-khaki" />
                <FaStar className="w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-khaki" />
              </div>
              <h4 className="text-base mb-4">{slider1.description}</h4>
              <div className="mb-7 md:mb-8 lg:mb-9 xl:mb-10">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl 3xl:text-6xl font-semibold leading-[40px] md:leading-[50px] 3xl:leading-[70px]">
                  {slider1.title}
                </h1>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl 3xl:text-6xl font-semibold leading-[40px] lg:leading-[50px] 2xl:leading-[60px]">
                  {slider1.subtitle}
                </h1>
              </div>
            </div>
            {/* contact info */}
            <div className="w-[221px] h-[50px] border-white border hidden md:flex items-center justify-center absolute left-0 top-1/2 -rotate-90">
              <BiPhoneCall className="w-5 h-5 mr-2 text-khaki" /> {tel}
            </div>
          </div>
        </SwiperSlide>
        {/* slider 2 */}
        <SwiperSlide>
          <div
            className="bg-[url('/photos/hero/jv-digital-fondo.png')] w-full h-[700px] md:h-[800px] xl:h-[850px] 3xl:h-[950px] bg-[rgba(30,30,30,0.4)] bg-opacity-40 grid items-center bg-cover justify-center text-white relative pb-[150px] lg:pb-20 xl:pb-0"
            data-aos="fade-down"
          >
            <div className="font-Garamond 2xl:w-[720px] text-center">
              <div className="flex space-x-2 items-center justify-center mb-5 lg:mb-6">
                <div className="w-44 h-44 hover-animBg group transition-all duration-300 rounded-full border border-lightGray border-opacity-75 hover:border-khaki cursor-pointer grid items-center justify-center">
                  <FaInstagram className="text-lightGray text-opacity-75 group-hover:text-white group-hover:text-slateBlue-0 w-32 h-32" />
                </div>
              </div>
              <div className="mb-7 md:mb-8 lg:mb-9 xl:mb-10">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl 3xl:text-6xl font-semibold leading-[40px] md:leading-[50px] 3xl:leading-[70px]">
                  {slider2.title}
                </h1>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl 3xl:text-5xl font-medium leading-[30px] md:leading-[40px] 3xl:leading-[60px]">
                  {slider2.subtitle}
                </h2>
              </div>
            </div>
            <div className="w-[221px] h-[50px] border-white border hidden md:flex items-center justify-center absolute left-0 top-1/2 -rotate-90">
              <BiPhoneCall className="w-5 h-5 mr-2 text-khaki" /> {tel}
            </div>
          </div>
        </SwiperSlide>
        {/* slider 3 */}
        <SwiperSlide>
          <div
            className="bg-[url('/photos/hero/jv-digital-fondo.png')] w-full h-[700px] md:h-[800px] xl:h-[850px] 3xl:h-[950px]  bg-[rgba(30,30,30,0.4)] bg-opacity-40 grid items-center bg-cover justify-center text-white relative pb-[150px] lg:pb-20 xl:pb-0"
            data-aos="fade-down"
          >
            <div className="font-Garamond 2xl:w-[720px] text-center">
              <div className="flex space-x-2 items-center justify-center mb-5 lg:mb-6">
                    <div className=" w-44 h-44 hover-animBg group transition-all duration-300  rounded-full border border-lightGray border-opacity-75 hover:border-khaki cursor-pointer grid items-center justify-center">
                        <FaFacebookF className="text-lightGray text-opacity-75 group-hover:text-white group-hover:text-slateBlue-0 w-32 h-32 " />
                    </div>
              </div>
              <div className="mb-7 md:mb-8 lg:mb-9 xl:mb-10">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl 3xl:text-6xl font-semibold leading-[40px] md:leading-[50px] 3xl:leading-[70px]">
                  {slider3.title}
                </h1>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl 3xl:text-5xl font-medium leading-[30px] md:leading-[40px] 3xl:leading-[60px]">
                  {slider3.subtitle}
                </h2>
              </div>

            </div>
            <div className="w-[221px] h-[50px] border-white border hidden md:flex items-center justify-center absolute left-0 top-1/2 -rotate-90">
              <BiPhoneCall className="w-5 h-5 mr-2 text-khaki" /> {tel}
            </div>
          </div>
        </SwiperSlide>
        {/* slider 4 */}
        <SwiperSlide>
          <div
            className="bg-[url('/photos/hero/jv-digital-fondo.png')] w-full h-[700px] md:h-[800px] xl:h-[850px] 3xl:h-[950px]  bg-[rgba(30,30,30,0.4)] bg-opacity-40 grid items-center bg-cover justify-center text-white relative pb-[150px] lg:pb-20 xl:pb-0"
            data-aos="fade-down"
          >
            <div className="font-Garamond 2xl:w-[720px] text-center">
              <div className="flex space-x-2 items-center justify-center mb-5 lg:mb-6">
                    <div className=" w-44 h-44 hover-animBg group transition-all duration-300  rounded-full border border-lightGray border-opacity-75 hover:border-khaki cursor-pointer grid items-center justify-center">
                        <FaTripadvisor className="text-lightGray text-opacity-75 group-hover:text-white group-hover:text-slateBlue-0 w-32 h-32 " />
                    </div>
              </div>
              <div className="mb-7 md:mb-8 lg:mb-9 xl:mb-10">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl 3xl:text-6xl font-semibold leading-[40px] md:leading-[50px] 3xl:leading-[70px]">
                  {slider4.title}
                </h1>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl 3xl:text-5xl font-medium leading-[30px] md:leading-[40px] 3xl:leading-[60px]">
                  {slider4.subtitle}
                </h2>
              </div>

            </div>
            <div className="w-[221px] h-[50px] border-white border hidden md:flex items-center justify-center absolute left-0 top-1/2 -rotate-90">
              <BiPhoneCall className="w-5 h-5 mr-2 text-khaki" /> {tel}
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div
            className="bg-[url('/photos/hero/jv-digital-fondo.png')] w-full h-[700px] md:h-[800px] xl:h-[850px] 3xl:h-[950px]  bg-[rgba(30,30,30,0.4)] bg-opacity-40 grid items-center bg-cover justify-center text-white relative pb-[150px] lg:pb-20 xl:pb-0"
            data-aos="fade-down"
          >
            <div className="font-Garamond 2xl:w-[720px] text-center">
              <div className="flex space-x-2 items-center justify-center mb-5 lg:mb-6">
                    <div className=" w-44 h-44 hover-animBg group transition-all duration-300  rounded-full border border-lightGray border-opacity-75 hover:border-khaki cursor-pointer grid items-center justify-center">
                        <FaGoogle className="text-lightGray text-opacity-75 group-hover:text-white group-hover:text-slateBlue-0 w-32 h-32 " />
                    </div>
              </div>
              <div className="mb-7 md:mb-8 lg:mb-9 xl:mb-10">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl 3xl:text-6xl font-semibold leading-[40px] md:leading-[50px] 3xl:leading-[70px]">
                  {slider5.title}
                </h1>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl 3xl:text-5xl font-medium leading-[30px] md:leading-[40px] 3xl:leading-[60px]">
                  {slider5.subtitle}
                </h2>
              </div>

            </div>
            <div className="w-[221px] h-[50px] border-white border hidden md:flex items-center justify-center absolute left-0 top-1/2 -rotate-90">
              <BiPhoneCall className="w-5 h-5 mr-2 text-khaki" /> {tel}
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default HeroSection;
