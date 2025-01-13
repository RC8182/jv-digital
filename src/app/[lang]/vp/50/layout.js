export const metadata = {
  es: {
    title: "Festa 50 Alessia & Carol!",
    description: "",
    icon: "https://jv-digital.com/icons/vp/50/icon.jpg",
  },
  en: {
    title: "Festa 50 Alessia & Carol!",
    description: "",
    icon: "https://jv-digital.com/icons/vp/50/icon.jpg",
  },
  it: {
    title: "Festa 50 Alessia & Carol!",
    description: "",
    icon: "https://jv-digital.com/icons/vp/50/icon.jpg",
  },
};

export default function VcLayout({ children, params }) {
  const idioma = params.lang;
  const { title, description, icon } = metadata[idioma];

  return (
    <html lang={idioma}>
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {/* Etiquetas Open Graph para WhatsApp */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={icon} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={`https://jv-digital.com/${idioma}`} />
        <link rel="icon" href={icon} type="image/jpg" />
        <link rel="apple-touch-icon" href={icon} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
