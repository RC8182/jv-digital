// This metadata object will automatically populate the <head> section
export const metadata = {
  title: "Cumple Caro!",
  description: "",
  metadataBase: new URL('https://jv-digital.com/es/vp/50'), // Define la base de la URL
  // You can add other meta tags or settings here as needed
};

export default function PartyCardLayout({ children }) {
  return (
    <div lang="es">
      <div>{children}</div>
    </div>
  );
}
