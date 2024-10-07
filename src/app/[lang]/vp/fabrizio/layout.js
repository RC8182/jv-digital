
// This metadata object will automatically populate the <head> section
export const metadata = {
  title: "Cumple de Fabrizio!",
  description: "Hola Soy Fabrizio y quería invitarte a mi Cumple Playa el 29-08-2024",
  openGraph: {
    title: "Cumple de Fabrizio!",
    description: "Hola Soy Fabrizio y quería invitarte a mi Cumple Playa el 29-08-2024",
    images: [
      {
        url: "/public/portada/portada.png",
        alt: "Imagen de la portada del Cumple de Fabrizio",
      },
    ],
    type: "website",
    url: "https://jv-digital.com/es/vp/fabrizio", // You can dynamically set this if necessary
  },
  metadataBase: new URL('https://jv-digital.com/es/vp/fabrizio'), // Define la base de la URL
  // You can add other meta tags or settings here as needed
};

export default function PartyCardLayout({ children }) {
  return (
    <div lang="es">
      <div>{children}</div>
      
    </div>
  );
}
