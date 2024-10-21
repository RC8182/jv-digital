"use client";
import "../1/style.css";
import Image from "next/image";
import "swiper/swiper-bundle.css";
import Line from "/public/images/banner/banner-line.png";
import One from "/public/images/banner/banner-two-left-line.png";
import Two from "/public/images/banner/banner-two-solid-right-down.png";
import Three from "/public/images/banner/banner-two-solid-right-up.png";
import Four from "/public/images/banner/banner-two-right-shape.png";
import Five from "/public/images/banner/banner-two-circle-solid.png";
import Six from "/public/images/banner/banner-two-circle-regular.png";

const PortadaSection = ({idioma}) => {
  const contenido = {
    es: {
      text: {
        title: "Lleva tu negocio al siguiente nivel",
        subtitle: "Con JV-DIGITAL",
        description: "Expertos en Marketing Digital y Estrategias Empresariales",
        tagline: "Transformamos Ideas en Presencia Digital"
      },
    },
    en: {
      text: {
        title: "Take Your Business to the Next Level",
        subtitle: "With JV-DIGITAL",
        description: "Experts in Digital Marketing and Business Strategies",
        tagline: "We Transform Ideas into Digital Presence"
      },
    },
    it: {
      text: {
        title: "Porta la tua attività al livello successivo",
        subtitle: "Con JV-DIGITAL",
        description: "Esperti in Marketing Digitale e Strategie Aziendali",
        tagline: "Trasformiamo Idee in Presenza Digitale"
      },
    },
  };
  

  const { text } = contenido[idioma];
  return (
    <section className="banner-two-area">
      <div className="banner-two__line">
        <Image className="sway_Y__animation" src={Line} alt="shape" priority />
      </div>
      <div className="swiper banner__slider">

            <div>
              <div
                className="banner-two__line-left"
                data-animation="slideInLeft"
                data-duration="3s"
                data-delay=".3s"
              >
                <Image src={One} alt="shape" priority />
              </div>
              <div
                className="banner-two__shape2"
                data-animation="slideInRight"
                data-duration="2s"
                data-delay=".3s"
              >
                <Image src={Two} alt="shape" priority />
              </div>
              <div
                className="banner-two__shape1"
                data-animation="slideInRight"
                data-duration="2s"
                data-delay=".5s"
              >
                <Image src={Three} alt="shape" priority />
              </div>
              <div
                className="banner-two__right-shape "
                data-aos="fade-right"
                data-aos-delay="200"
                data-aos-duration="1500"
              >
                <Image
                  className="sway_Y__animation"
                  src={Four}
                  alt="shape"
                  priority
                />
              </div>
              <div className="banner-two__circle-solid">
                <Image
                  className="animation__rotate"
                  src={Five}
                  alt="shape"
                  priority
                />
              </div>
              <div className="banner-two__circle-regular">
                <Image
                  className="animation__rotateY"
                  src={Six}
                  alt="shape"
                  priority
                />
              </div>
              <div
                className="slide-bg"
                style={{
                  backgroundImage: "linear-gradient(to bottom, navy, black, navy)",
                }}
              ></div>
              <div className="container">
                <div className="banner-two__content text-center text-white">
                  <h4
                    data-animation="fadeInUp"
                    data-delay=".3s"
                    className=" mb-10"
                  >
                    {text.title}
                    <br />
                    {text.subtitle}
                  </h4>
                  <h1
                    data-animation="fadeInUp"
                    data-delay=".5s"
                    className=""
                  >
                    {text.description}
                  </h1>
                  <p
                    data-animation="fadeInUp"
                    data-delay=".7s"
                    className="mt-20 "
                  >
                  {text.tagline}
                  </p>
                </div>
              </div>
            </div>
      </div>
      <div className="banner__dot-wrp banner-two__dot-wrp">
        <div className="dot-light banner__dot"></div>
      </div>
    </section>
  );
};

export default PortadaSection;
