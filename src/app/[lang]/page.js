import Image from 'next/image';
import portada from '../../../public/photos/portada.png'

export default function Home() {
  
  return (
    <div>
      <meta name="google-site-verification" content="6Wleb1gKWBvvhDhTruIXhwFweF4P7KhhoVpZ-UM1-y4" />
      <div className="w-full h-full">
        <Image 
            src={portada} 
            alt="JV-Digital foto de Portada" 
            layout="fill" 
            objectFit="contain" 
        />
      </div>
    </div>
  );
}
