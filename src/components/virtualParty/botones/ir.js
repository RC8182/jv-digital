import Link from "next/link";
import { FaCar } from 'react-icons/fa';

export const Direccion = ({bgcolor, color, address, title}) => { 

  return (
    <button className={`${color} ${bgcolor} p-2 rounded flex items-center space-x-2 xxs:p-1 xxs:space-x-1`}>
      <FaCar />
      <Link href={`${address}`} target="_blank">
        <span className="xxs:text-xxs">{title}</span>
      </Link>
    </button>
  );
};
