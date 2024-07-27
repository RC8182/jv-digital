
import { Parallax } from "../parallax/parallax";
import { datos } from "./db";

export default async function Galeria({idioma}) {

  const datosGaleria =( idioma=='es') ? datos.es : datos.en;
  const data = datosGaleria.galeria.imagenes;

  return (
    <div className="bg-blue-900 text-white w-full p-2 lg:min-w-[100vw]">

        <div className="flex flex-col items-center flex-wrap mb-10" id="galeria">        
          {data.map((e,i)=>{
            return <Parallax img={e.url.src} alt={e.alt} title={e.title} key={i} /> 
          })}
        </div>
    </div>
  )
}
