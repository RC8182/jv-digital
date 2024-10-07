import Link from "next/link";
import { FaCar } from 'react-icons/fa';

export const Direccion = ({idioma, bgcolor, color, address}) => {
  const text={
    es:'Ir a la Fiesta',
    it:'',
    en:''
  }

  return (
    <button className={`${color} ${bgcolor} text-xs p-2 rounded  flex items-center space-x-2`}>
      <FaCar />
      <Link href={`${address}`} target="blank">
        <span>{ text[idioma]}</span>
      </Link>
    </button>
  );
};
