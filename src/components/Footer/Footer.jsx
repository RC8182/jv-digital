import { IoIosCall } from "react-icons/io";
import { IoLocationSharp } from "react-icons/io5";
import { BiEnvelope, BiLogoLinkedin } from "react-icons/bi";
import { FaFacebookF, FaInstagram,} from "react-icons/fa";
import Brand from "../Brand/Brand";
import Link from "next/link";


const contenido = {
  es: {
    contactInfo: "INFORMACIÓN DE CONTACTO",
    ourClients: "Nuestros Clientes",
    gallery: "GALERÍA",
    address: "Calle Caracol Nº3, Tenerife - 38618",
    clients: [
      { name: "Azul Kiteboarding", url: "https://www.azulkiteboarding.com/es/" },
      { name: "Arena Negra Restaurante", url: "https://arena-negra-restaurant.com/es" },
      { name: "La Niña Restaurante", url: "https://la-nina-restaurante.com/" },
      { name: "La Cañita Cocktail Bar", url: "https://arena-negra-restaurant.com/es/la-canita" },
      { name: "La Paella Restaurante", url: "https://la-paella-restaurante.com/es" },
      { name: "Tenerife Kite Foil", url: "https://tenerife-kite-foil.com/es" }
    ]
  },
  en: {
    contactInfo: "CONTACT INFO",
    ourClients: "Our Clients",
    gallery: "GALLERY",
    address: "3 Caracol Rd, Tenerife - 38618",
    clients: [
      { name: "Azul Kiteboarding", url: "https://www.azulkiteboarding.com/en/" },
      { name: "Arena Negra Restaurant", url: "https://arena-negra-restaurant.com/en" },
      { name: "La Niña Restaurant", url: "https://la-nina-restaurante.com/" },
      { name: "La Cañita Cocktail Bar", url: "https://arena-negra-restaurant.com/en/la-canita" },
      { name: "La Paella Restaurant", url: "https://la-paella-restaurante.com/" },
      { name: "Tenerife Kite Foil", url: "https://tenerife-kite-foil.com/" }
    ]
  },
  it: {
    contactInfo: "INFORMAZIONI DI CONTATTO",
    ourClients: "I Nostri Clienti",
    gallery: "GALLERIA",
    address: "Strada Caracol Nº3, Tenerife - 38618",
    clients: [
      { name: "Azul Kiteboarding", url: "https://www.azulkiteboarding.com/es/" },
      { name: "Arena Negra Ristorante", url: "https://arena-negra-restaurant.com/es" },
      { name: "La Niña Ristorante", url: "https://la-nina-restaurante.com/" },
      { name: "La Cañita Cocktail Bar", url: "https://arena-negra-restaurant.com/es/la-canita" },
      { name: "La Paella Ristorante", url: "https://la-paella-restaurante.com/" },
      { name: "Tenerife Kite Foil", url: "https://tenerife-kite-foil.com/" }
    ]
  }
};

const Footer = ({ idioma }) => {
  const { contactInfo, ourClients, gallery, address, clients } = contenido[idioma];

  return (
    <>
      <Brand />
      <footer className="">
        {/* footer content */}
        <div className="bg-[#1d42bd]">
          <div className="Container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 2xl:grid-cols-12 gap-5 lg:gap-3 xl:gap-5 2xl:gap-[30px] pt-14 lg:pt-[100px]">
            {/* Footer Content one. */}
            <div
              className="lg:mt-[-195px] lg:col-span-3 2xl:col-span-4 bg-blue-900"
              data-aos="fade-up"
              data-aos-duration="1000"
            >
              <div className="py-6 md:py-7 lg:py-[50px] px-10 lg:px-5 xl:px-8 2xl:px-9">
                {/* <img src="/images/home-1/logo-1.png" alt="" /> */}
                <div className="py-8 2xl:py-[50px]">
                  <h1 className="text-lg sm:text-xl md:text-[22px] leading-[38px] font-medium text-metal relative font-Garamond before:w-7 before:h-[1px] before:bg-khaki before:absolute before:left-0 before:top-10">
                    {contactInfo}
                  </h1>
                  <div className="space-y-4 pt-[30px] pb-2 2xl:pb-[30px]">
                    <p className="flex items-center text-white font-Lora font-normal text-sm sm:text-base leading-[26px] mt-2">
                      <IoIosCall className="text-khaki w-5 h-5 mr-3 2xl:mr-4" size={14} />
                      +34 648 416 513
                    </p>
                    <p className="flex items-center text-white font-Lora font-normal text-sm sm:text-base leading-[26px]">
                      <BiEnvelope className="text-khaki w-5 h-5 mr-3 2xl:mr-4" size={14} />
                      info.jv.digital@gmail.com
                    </p>
                    <p className="flex items-center text-white font-Lora font-normal text-sm sm:text-base leading-[26px]">
                      <IoLocationSharp className="text-khaki w-5 h-5 mr-3 2xl:mr-4" size={14} />
                      {address}
                    </p>
                  </div>
                </div>
                <div>
                  <ul className="flex space-x-3">
                    <li className="hover-animBg group transition-all duration-300 rounded-full border border-metal border-opacity-75 hover:border-khaki cursor-pointer w-[37px] h-[37px] grid items-center justify-center">
                      <Link href="https://www.facebook.com/profile.php?id=61560950767368" className="">
                        <FaFacebookF className="text-white text-opacity-75 group-hover:text-lightGray group-hover:text-slateBlue-0 w-4 h-4" />
                      </Link>
                    </li>
                    <li className="hover-animBg group transition-all duration-300 rounded-full border border-metal border-opacity-75 hover:border-khaki cursor-pointer w-[37px] h-[37px] grid items-center justify-center">
                      <Link href="https://www.instagram.com/jvdigital81">
                        <FaInstagram className="text-white text-opacity-75 group-hover:text-lightGray group-hover:text-slateBlue-0 w-4 h-4" />
                      </Link>
                    </li>
                    <li className="hover-animBg group transition-all duration-300 rounded-full border border-metal border-opacity-75 hover:border-khaki cursor-pointer w-[37px] h-[37px] grid items-center justify-center">
                      <Link href="https://www.linkedin.com/company/103650480/admin/inbox/">
                        <BiLogoLinkedin className="text-white text-opacity-75 group-hover:text-lightGray group-hover:text-slateBlue-0 w-4 h-4" />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* footer content-2 */}
            <div
              className="pt-0 pb-8 overflow-x-hidden lg:col-span-2 2xl:col-span-2 ml-2"
              data-aos="fade-up"
            >
              <h1 className="text-lg sm:text-xl md:text-[22px] leading-[38px] font-medium text-metal relative font-Garamond before:w-7 before:h-[1px] before:bg-khaki before:absolute before:left-0 before:top-10 uppercase">
                {ourClients}
              </h1>
              <div className="pt-[30px] pb-0 lg:py-[30px]">
                <ul className="text-white font-Lora font-normal text-sm sm:text-base leading-[26px] list-none hover:list-disc">
                  {clients.map((client, index) => (
                    <li key={index} className="hover:ml-[17px] md:hover:ml-[18px] transition-all duration-500 hover:text-khaki leading-[44px]">
                      <Link href={client.url} target="blank">{client.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* footer content-3 */}
            {/* <div
              className="p-2 pb-8 lg:col-span-3 2xl:col-span-3"
              data-aos="fade-up"
              data-aos-duration="1000"
            >
              <h1 className="text-lg sm:text-xl md:text-[22px] leading-[38px] font-medium text-metal relative font-Garamond before:w-7 before:h-[1px] before:bg-khaki before:absolute before:left-0 before:top-10 uppercase">
                {gallery}
              </h1>
              <div className="grid grid-cols-3 gap-2 mt-[45px] w-[250px] sm:w-[300px] lg:w-full content-center">
                <img src="/images/home-1/gallery-1.jpg" alt="" />
              </div>
            </div> */}
            {/* footer content-4 */}
          </div>
          <div className="text-center py-5 2xl:py-7 bg-[#161616] text-white text-sm md:text-base text-lightGray font-Lora font-normal">
            {` © ${new Date().getFullYear()} , JV-Digital. All Rights Reserved.`}
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
