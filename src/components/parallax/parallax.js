import React from 'react'
import { AltComponent } from './altComponent/altComponent'
export const Parallax = ({img , alt, title}) => {

  return (
    <div className='w-full'>
        <div className='seccion h-auto items-center justify-center p-5 text-center text-3xl'>
              {title}
        </div>
        <div 
          className='fondo relative bg-blue-900 bg-fixed bg-center bg-no-repeat bg-cover' 
          style={{minWidth: '300px', minHeight: '600px', backgroundImage: `url(${img})`}}>
            <AltComponent alt={alt}/>
            <div 
                className='contenedor-titulo absolute inset-0 text-center'>
            </div>
        </div>

        
    </div>
  )
}
