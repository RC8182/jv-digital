'use client';
import React, { useEffect } from 'react';
import Checkboxes from './checkboxes';
import useStore from '@/store/planesStore';

const translations = {
  en: {
    title: "Choose Your Plan",
    subtitle: "Select the plan that best fits your business and secure your online presence.",
    firstWeek: "Week 1:",
    subsequentWeeks: "Then:",
    perWeek: "/weekly",
    price: "Price:",
    contact: "Contact",
    serviceInfo: "* All our plans include access to IT service once a month at no additional cost",
    domainInfo: "* We offer the domain for free during the first year. From the second year, the annual cost will be approximately 30€, depending on the rates set by the domain provider.",
    reservesService: "Reservation Service",
    planPlus: "Plan Plus"
  },
  es: {
    title: "Elige Tu Plan",
    subtitle: "Elige el plan que mejor se adapte a tu negocio y asegura tu presencia OnLine.",
    firstWeek: "Semana 1:",
    subsequentWeeks: "Luego:",
    perWeek: "/semanal",
    price: "Precio:",
    contact: "Contacta",
    serviceInfo: "* Todos nuestros planes incluyen acceso al servicio informático una vez al mes sin ningún costo adicional",
    domainInfo: "* Ofrecemos el dominio de forma gratuita durante el primer año. A partir del segundo año, el costo anual será aproximadamente de 30€, dependiendo de las tarifas establecidas por el proveedor del dominio.",
    reservesService: "Servicio de Reservas",
    planPlus: "Plan Plus"
  },
  it: {
    title: "Scegli Il Tuo Piano",
    subtitle: "Scegli il piano che meglio si adatta alla tua attività e assicura la tua presenza online.",
    firstWeek: "Settimana 1:",
    subsequentWeeks: "Poi:",
    perWeek: "/settimana",
    price: "Prezzo:",
    contact: "Contatta",
    serviceInfo: "* Tutti i nostri piani includono l'accesso al servizio informatico una volta al mese senza costi aggiuntivi",
    domainInfo: "* Offriamo il dominio gratuitamente durante il primo anno. Dal secondo anno, il costo annuale sarà di circa 30€, a seconda delle tariffe stabilite dal provider del dominio.",
    reservesService: "Servizio di Prenotazione",
    planPlus: "Piano Plus"
  }
};




const PricingPlans = ({ db }) => {
  const { plans, setPlans } = useStore((state) => ({
    plans: state.plans,
    setPlans: state.setPlans,
  }));

  useEffect(() => {
    setPlans(db.planes);
  }, [db.planes, setPlans]);

  const idioma = db.idioma;
  const booking = 25;
  const plus = 15;

  const switchPlans = (plan, t) => {
    let firstWeekPrice = plan.firstWeekPrice;
    let subsequentWeeksPrice = plan.subsequentWeeksPrice;
    let feature = [...plan.features];
  
    if (plan.reserves) {
      firstWeekPrice += booking;
      subsequentWeeksPrice += booking;
      if (!feature.includes(t.reservesService)) {
        feature.unshift(t.reservesService);
      }
    }
  
    if (plan.plus) {
      firstWeekPrice += plus;
      subsequentWeeksPrice += plus;
  
      const alcanceIndex = feature.findIndex(f => f.includes('Alcance'));
      const clicksIndex = feature.findIndex(f => f.includes('Clicks'));
  
      if (alcanceIndex !== -1) feature[alcanceIndex] = 'Alcance 26.000 Personas';
      if (clicksIndex !== -1) feature[clicksIndex] = 'Clicks 50';
  
      if (!feature.includes(t.planPlus)) {
        feature.unshift(t.planPlus);
      }
    }
  
    return { firstWeekPrice, subsequentWeeksPrice, feature };
  };
  

  const t = translations[idioma] || translations.es;

  return (
    <section className="bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">{t.title}</h2>
          <p className="mt-4 text-xl text-gray-400">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {plans?.map((plan, index) => {
            const { firstWeekPrice, subsequentWeeksPrice, feature } = switchPlans(plan, t);

            return (
              <div key={index} className="bg-gray-800 rounded-lg shadow-lg p-6 transform hover:scale-105 transition duration-300">
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                  <p className="mt-4 text-gray-400">{plan.description}</p>
                </div>
                {plan.checkbox ? (
                  <div className="mb-8">
                    <Checkboxes planIndex={index} reservesLabel={t.reservesService} plusLabel={t.planPlus} />
                    <span className="text-2xl font-extrabold text-white">{t.firstWeek}<br /><span className='text-4xl m-4'>{firstWeekPrice}€</span> </span>
                    <br />
                    <span className="text-2xl font-extrabold text-white">{t.subsequentWeeks} <br /><span className='text-4xl m-4'>{subsequentWeeksPrice}€</span></span>
                    <span className="text-xl font-medium text-gray-400">{t.perWeek}</span>
                  </div>
                ) : (
                  <div className="mb-8">
                    <span className="text-2xl font-extrabold text-white">{t.price}<br /><span className='text-4xl m-4'>{firstWeekPrice}€</span> </span>
                  </div>
                )}

                <ul className="mb-8 space-y-4 text-gray-400">
                  {feature.map((e, idx) => (
                    <li key={idx} className="flex items-center">
                      <svg className="h-6 w-6 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
                <a href="https://api.whatsapp.com/send/?phone=34648416513" target="_blank" className="block w-full py-3 px-6 text-center rounded-md text-white font-medium bg-gradient-to-r from-logo1 to-logo2 hover:from-logo1 hover:to-logo2">
                  {t.contact}
                </a>
              </div>
            );
          })}
        </div>
        <div className='m-10 text-sm text-gray-400'>
          <p>{t.serviceInfo}</p>
          <p>{t.domainInfo}</p>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
