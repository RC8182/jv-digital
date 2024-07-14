'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import Image from 'next/image';
import it from '/public/photos/icons/it.png';
import es from '/public/photos/icons/es.png';
import uk from '/public/photos/icons/uk.png';

export const Idiomas = () => {
  const pathname = usePathname();
  const dividir = pathname.split('/');
  const ruta = dividir.slice(2).join('/'); // Excluir el prefijo del idioma y obtener el resto de la ruta

  return (
    <div className="p-2 w-30 h-8 text-sm text-white bg-blue-600 rounded-lg flex items-center justify-center gap-8">
      <Link href={`/es/${ruta}`}><Image src={es} alt="Español" width={20} height={20} /></Link> 
      <Link href={`/it/${ruta}`}><Image src={it} alt="Italiano" width={20} height={20} /></Link> 
      <Link href={`/en/${ruta}`}><Image src={uk} alt="English" width={20} height={20} /></Link> 
    </div>
  );
};




