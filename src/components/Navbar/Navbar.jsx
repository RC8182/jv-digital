'use client'
import { FaBars } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { BiChevronDown } from "react-icons/bi";
import { useState } from "react";
import Link from "next/link";
import logo from '/public/photos/icons/jv-digital-rm-bg.png';
import { Idiomas } from "../botones/idiomas";

// JSON object containing navigation links and sub-links
const navLinks = {
  es: [
    { name: "Inicio", path: "/", subLinks: [] },
    { name: "Sobre nosotros", path: "#about", subLinks: [] },
    {
      name: "Redes Sociales",
      path: "#",
      subLinks: [
        { name: "Facebook", path: "https://www.facebook.com/profile.php?id=61560950767368" },
        { name: "Instagram", path: "https://www.instagram.com/jvdigital81" },
        { name: "LinkedIn", path: "https://www.linkedin.com/company/103650480/admin/inbox/" },
      ],
    },
    {
      name: "Contáctanos",
      path: "#",
      subLinks: [
        { name: "Javier Visconti", path: "/vc/j-visconti" },
        { name: "Barbara Visconti", path: "/vc/b-visconti" },
      ],
    },
  ],
  en: [
    { name: "Home", path: "/", subLinks: [] },
    { name: "About us", path: "#about", subLinks: [] },
    {
      name: "Social Network",
      path: "#",
      subLinks: [
        { name: "Facebook", path: "https://www.facebook.com/profile.php?id=61560950767368" },
        { name: "Instagram", path: "https://www.instagram.com/jvdigital81" },
        { name: "LinkedIn", path: "https://www.linkedin.com/company/103650480/admin/inbox/" },
      ],
    },
    {
      name: "Contact us",
      path: "#",
      subLinks: [
        { name: "Javier Visconti", path: "/vc/j-visconti" },
        { name: "Barbara Visconti", path: "/vc/b-visconti" },
      ],
    },
  ],
  it: [
    { name: "Home", path: "/", subLinks: [] },
    { name: "Chi siamo", path: "#about", subLinks: [] },
    {
      name: "Reti Sociali",
      path: "#",
      subLinks: [
        { name: "Facebook", path: "https://www.facebook.com/profile.php?id=61560950767368" },
        { name: "Instagram", path: "https://www.instagram.com/jvdigital81" },
        { name: "LinkedIn", path: "https://www.linkedin.com/company/103650480/admin/inbox/" },
      ],
    },
    {
      name: "Contattaci",
      path: "#",
      subLinks: [
        { name: "Javier Visconti", path: "/vc/j-visconti" },
        { name: "Barbara Visconti", path: "/vc/b-visconti" },
      ],
    },
  ],
};

const Navbar = ({ idioma }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`w-full font-Lora z-20 lg:px-5 lg:py-2 bg-blue-900`}>
      <div className="lg:px-10">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="w-48 lg:w-52 lg:p-4">
            <Link href="/">
              <img src={logo.src} className="hidden lg:block w-full" alt="website_logo" />
            </Link>
          </div>
          <div className="px-3 w-full lg:hidden flex justify-between text-lightBlack lg:text-white bg-khaki h-[70px] items-center p-3">
            <div className="w-28">
              <Link href="/">
                <img src={logo.src} className="block lg:hidden" alt="Royella_website_logo" />
              </Link>
            </div>
            <div className="flex items-center">
              <button className="lg:hidden block focus:outline-none" onClick={toggleNavbar}>
                {isOpen ? (
                  <IoMdClose className="w-6 h-6 text-white" />
                ) : (
                  <FaBars className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
          <ul className={`${isOpen ? "block" : "hidden"} text-left w-full lg:w-fit ease-in-out lg:flex space-y-2 lg:space-y-0 lg:text-center space-x-0 lg:space-x-3 xl:space-x-4 2xl:space-x-5 3xl:space-x-[24px] flex flex-col lg:flex-row text-sm text-lightBlack lg:text-white uppercase font-normal bg-[#1E3A8A80] lg:bg-transparent py-3 lg:py-0`}>
            {navLinks[idioma].map((link, index) => (
              <li key={index} className="relative group">
                <Link href={link.path} className="text-white lg:text-white lg:border-b-0 px-3 py-2 w-full transition-all duration-300 flex items-center">
                  {link.name}
                  {link.subLinks.length > 0 && <BiChevronDown className="ml-1" />}
                </Link>
                {link.subLinks.length > 0 && (
                  <div className="absolute pt-5 lg:pt-8 z-20 hidden group-hover:block">
                    <ul className="shadow-2xl rounded-sm bg-[#1E3A8A80] text-white w-[200px] text-left transition-all duration-500 text-sm py-4">
                      {link.subLinks.map((subLink, subIndex) => (
                        <div key={subIndex} className="px-5 group hover:bg-khaki hover:text-metal">
                          <li className="hover:ml-3 duration-300">
                            <Link href={subLink.path} target="blank" className="py-2 block">
                              {subLink.name}
                            </Link>
                          </li>
                        </div>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
            <Idiomas />
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
