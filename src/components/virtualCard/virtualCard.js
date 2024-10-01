import Image from 'next/image'
import React from 'react'
import Compartir from '../botones/compartir'
import Guardar from '../botones/guardar'
import Link from 'next/link'
import PricingPlans from '../pricingPlan/pricing'
import portada from '/public/photos/portada.png';
import icon from '/public/photos/icons/jv-digital1.png';
import { Llamar } from '../botones/llamar'
import { Email } from '../botones/email'
import { WhatsApp } from '../botones/whatsapp'
import { Idiomas } from '../botones/idiomas'

export const VirtualCard = ({db}) => {
  const agentName= db.agente.nombre;
  const puesto= db.agente.puesto;
  const serviciosList=db.servicios.items;
  const porQueElegirnosList= db.porQueElegirnos.items


  return (
    <div className="flex min-h-screen flex-col items-center justify-between w-full ">
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-gray-900">
          <Link href={'/'}>
            <div className="w-full">
              <Image src={portada} alt="JV-Digital foto de Portada" layout="responsive" width={920} height={200} className="rounded-t-lg" />
            </div>
          </Link>
          <div className="relative w-full">
            <div className="flex items-center justify-between gap-8 text-white h-10 p-4 bg-gpt_blue w-full">
              <Compartir title={db.botones.compartir}/>
              <Idiomas/>
              <Guardar title={db.botones.guardar}/>
            </div>
          </div>
          <div className=" p-8 shadow-lg rounded-b-lg w-full">
            <div className="m-2 text-2xl font-bold text-white flex justify-center items-center">
              <Link  href={'/'}>
              <div className="w-[120px] h-[120px] z-10">
                <Image src={icon} alt="Avatar" className="rounded-full" width={100} height={100} />
              </div>
              </Link>
              <div className=" text-center font-bold">
                <p>JV-Digital</p>
                <p>{agentName}</p>
              </div>   
            </div>

            <div className="mb-8 text-center text-xl text-gray-400">
              <p className="">{puesto}</p>
              </div>

              
              <div className="text-white">
              <hr className="divider border-t-2 border-gpt_blue m-2" />
              <div className="flex flex-col m-4">
                <div className="text-gpt_blue font-bold mb-2">{db.servicios.titulo}</div>
                <div className="ml-4">
                  {
                    serviciosList.map((e,i)=>{
                      return <p key={i}>{e}</p>
                    })
                  }

                </div>
              </div>
              <hr className="divider border-t-2 border-gpt_blue m-2" />
              <div className="flex flex-col m-4">
                <div className="text-gpt_blue font-bold mb-2">{db.clientes}</div>
                <div className="ml-4">
                  <p><Link href="https://www.azulkiteboarding.com" target="_blank">Azul Kiteboarding</Link></p>
                  <p><Link href="https://arena-negra-restaurant.com" target="_blank">Arena Negra Restaurante</Link></p>
                  <p><Link href="https://la-nina-restaurante.com" target="_blank">La Niña Restaurante</Link></p>
                  <p><Link href="#">La Cañita Restaurante</Link></p>
                  <p><Link href="https://tenerife-kite-foil.com"target="_blank">Tenerife Kite Wing</Link></p>
                </div>
              </div>
              <hr className="divider border-t-2 border-gpt_blue m-2" />
              <div className="flex flex-col m-4">
                <div className="text-gpt_blue font-bold">{db.porQueElegirnos.titulo}</div>
                <div className="ml-2 mt-2">
                  {
                    porQueElegirnosList.map((e,i)=>{
                     return <div key={i}>
                              <h2>{e.titulo}</h2>
                              <p className="ml-4 mb-2 text-xs">
                                {e.descripcion}
                              </p>
                            </div>
                    })
                  }
                </div>
                
              </div>
              <hr className="divider border-t-2 border-gpt_blue m-2" />
            </div>
          
          </div>
          <PricingPlans db={db}/>

          <div className="w-full mt-2 z-50">
          <div className="bg-gpt_blue fixed bottom-0 h-12 border-t-2 border-verde1 rounded-t-lg overflow-hidden w-full max-w-4xl mx-auto">
            <div className="flex px-10 items-center justify-between text-white">
              <Llamar title={db.botones.llamar} numero={db.agente.tel}/>
              <Email email={db.agente.email} asunto={db.agente.asunto}/>
              <WhatsApp numero={db.agente.tel}/>
            </div>
          </div>
          </div>
        </div>
      </div>
  )
}
