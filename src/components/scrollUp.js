'use client'
import { useEffect, useState } from "react";
import { BiChevronUp } from "react-icons/bi";

const ScrollToTopButton = ({color, bgcolor, bordercolor}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      window.scrollY > 500 ? setIsVisible(true) : setIsVisible(false);
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    isVisible &&
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
  };

  return (
    <button
      className={`fixed bottom-16 right-4 rounded-full p-4 ${bgcolor} ${color} ${bordercolor} border-2 outline-none transition-opacity duration-200 z-50 ${
        isVisible ? "opacity-100" : "opacity-0"
      } xxs:bottom-12 xxs:right-2 xxs:p-2`}
      onClick={scrollToTop}
      style={{ cursor: "pointer" }}
      aria-label="Scroll to top"
    >
      <BiChevronUp className={`h-5 w-5 ${color} xxs:h-4 xxs:w-4`} />
    </button>
  );
};

export default ScrollToTopButton;
