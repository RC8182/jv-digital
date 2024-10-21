import Image from "next/image";
import One from "/public/images/shape/offer-shadow-shape.png";
import Two from "/public/images/shape/offer-bg-shape-left.png";
import Three from "/public/images/shape/offer-bg-shape-right.png";


// Importamos iconos de React Icons

import DeviceFrame from "@/components/deviseIfram/deviseIframe";


const VirtualCard = () => {


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
      <div className="flex flex-wrap gap-8">
        <DeviceFrame src="https://jv-digital.com/es/vp/fabrizio" device="mobile" />
        <DeviceFrame src="https://jv-digital.com/es/vp/fabrizio"  />
        <DeviceFrame src="https://jv-digital.com/es/vp/50" device="mobile" />
        <DeviceFrame src="https://jv-digital.com/es/vp/50"  />
      </div>
    </section>
  );
};

export default VirtualCard;
