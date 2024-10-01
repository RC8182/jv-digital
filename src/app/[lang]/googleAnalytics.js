'use client'
import { useEffect, useState } from "react"
import Script from "next/script"
import * as gtag from "../../../gtag"

const GoogleAnalytics = ({ idioma }) => {
    const cookie_text = (idioma === 'es') 
        ? "Usamos cookies de estadísticas para mejorar tu experiencia. ¿Aceptas el uso de estas cookies?" 
        : "We use statistical cookies to improve your experience. Do you accept the use of these cookies?";
    
    const [consentGiven, setConsentGiven] = useState(null);  // Cambiado a 'null' inicialmente

    useEffect(() => {
        const consent = localStorage.getItem("consentGiven");
        if (consent === "true") {
            setConsentGiven(true);
        } else {
            setConsentGiven(false);
        }
    }, []);

    const handleConsent = () => {
        localStorage.setItem("consentGiven", "true");
        setConsentGiven(true);
    }

    const handleClose = () => {
        setConsentGiven(true);
    }

    if (consentGiven === null) {
        return null;  // Evita renderizar hasta que se haya cargado el estado
    }

    return (
        <>
            {!consentGiven && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="absolute top-4 right-4">
                        <button onClick={handleClose} className="text-white text-2xl">✖</button>
                    </div>
                    <div className="bg-white p-6 m-4 shadow-lg rounded-lg text-center">
                        <p className="mb-4">{cookie_text}</p>
                        <button
                            onClick={handleConsent}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            )}
            {consentGiven && (
                <>
                    <Script
                        strategy="afterInteractive"
                        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
                    />
                    <Script
                        id="gtag-init"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                              window.dataLayer = window.dataLayer || [];
                              function gtag(){dataLayer.push(arguments);}
                              gtag('js', new Date());
                              gtag('config', '${gtag.GA_TRACKING_ID}', {
                              page_path: window.location.pathname,
                              });
                            `,
                        }}
                    />
                </>
            )}
        </>
    );
}

export default GoogleAnalytics;
