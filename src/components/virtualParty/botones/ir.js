import Link from "next/link";
import { FaCar } from 'react-icons/fa';

export const Direccion = ({bgcolor, color, address, title}) => { 

  return (
    <button className={`${color} ${bgcolor} p-2 rounded  flex items-center space-x-2`}>
      <FaCar />
      <Link href={`${address}`} target="blank">
        <span>{title}</span>
      </Link>
    </button>
  );
};
