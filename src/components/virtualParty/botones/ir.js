import Link from "next/link";
import { FaCar } from 'react-icons/fa';

export const Direccion = () => {
  return (
    <button className="bg-blue-500 text-white text-xs p-2 rounded  flex items-center space-x-2">
      <FaCar />
      <Link href={`https://www.google.es/maps/dir//Playa+de+la+Jaquita,+38612,+Santa+Cruz+de+Tenerife/@28.0505331,-16.5714344,13z/data=!4m9!4m8!1m0!1m5!1m1!1s0xc40200a2f289fd5:0x9e2f4a25fb1b1094!2m2!1d-16.5302348!2d28.0504635!3e0?hl=es&entry=ttu`} target="blank">
        <span>Ir a la Fiesta</span>
      </Link>
    </button>
  );
};
