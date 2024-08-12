'use client'
import { useEffect, useState } from "react";
import { BiChevronUp } from "react-icons/bi";

const ScrollToTopButton = () => {
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
      className={`fixed bottom-16 right-4 rounded-full p-4 bg-black text-metal border-metal border-2 outline-none transition-opacity duration-200 z-50 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={scrollToTop}
      style={{ cursor: "pointer" }}
    >
      <BiChevronUp className="h-5 w-5 text-blue-500" />
    </button>
  );
};

export default ScrollToTopButton;
