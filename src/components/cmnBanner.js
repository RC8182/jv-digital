import Link from "next/link";
import Image from "next/image";
import { FaAngleRight } from "react-icons/fa";  // Reemplazo de FontAwesome por React Icons
import One from "/public/images/banner/inner-banner-shape2.png";
import Two from "/public/images/banner/inner-banner-shape1.png";
import Three from "/public/images/banner/inner-banner-shape3.png";

const CmnBanner = ({ title }) => {
  return (
    <section
      className="relative bg-cover bg-center pt-44 pb-44"
      style={{
        backgroundImage: "linear-gradient(to bottom, navy, black, navy)",
      }}
    >
      {/* Formas animadas */}
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
        <Image src={Two} alt="shape" priority />
      </div>
      <div
        className="absolute top-0 right-0"
        data-aos="fade-right"
        data-aos-delay="200"
        data-aos-duration="1500"
      >
        <Image className="animate-sway" src={Three} alt="shape" priority />
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto text-center">
        <h2
          className="text-4xl font-semibold text-white"
          data-aos="fade-up"
          data-aos-delay="0"
          data-aos-duration="1500"
        >
          {title}
        </h2>
        <div
          className="mt-4 text-white flex justify-center items-center space-x-2"
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="1500"
        >
          <Link href="/" className="hover:text-gray-300 transition">
            Home
          </Link>
          <FaAngleRight className="mx-2 text-gray-300" />
          <span>{title}</span>
        </div>
      </div>
    </section>
  );
};

export default CmnBanner;
