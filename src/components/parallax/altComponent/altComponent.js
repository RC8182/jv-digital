import Image from 'next/image'
import img from './img_alt_component.png'
export const AltComponent = ({alt}) => {
  return (
    <Image src={img.src} alt={alt} loading="lazy" style={{opacity: 0}} width={1} height={1} />
  )
}
