const nombre= 'Javier Visconti'
const email= 'javiervisconti@hotmail.com'
const tel= '34648416513'
const direccion= 'Los Abrigos, Tenerife'
export const data= {
    'es':{
        idioma:'es',
        agente:{
            nombre:nombre,
            puesto:'Informática, Programación y Gestión Integral de Redes Sociales',
            email: email,
            asunto: 'Consulta de JV-Digital',
            tel: tel,
            direccion: direccion,
        },
        botones:{
            compartir:'Compartir',
            guardar:'Guardar',
            llamar:'LLamar'
        },
        servicios:{
            titulo:'Servicios',
            items: ['Informática en general', 'Presencia Online', 'Programación y Diseño Web', 'Creación y Gestión de Paginas Web y Redes Sociales', 'Alojamiento Web Gratuito']
        },
        clientes:'Nuestros Clientes',
        porQueElegirnos:{
            titulo:'Por que Elegirnos',
            items:[
                {
                 titulo:'🌐 Presencia Online:',
                 descripcion:'¿Necesitas destacar en la web? Ofrecemos servicios de gestión integral en redes sociales, creación de páginas web y más.'   
                },
                {
                 titulo:'📱 Redes Sociales:',
                 descripcion:'Potenciamos tu presencia en Facebook, Instagram, Google My Business y TripAdvisor. Llega a más clientes y aumenta tus ventas.'   
                },
                {titulo:'💻 Servicios de Informática:',
                descripcion:'Soporte técnico, mantenimiento y desarrollo de software. ¡Siempre es bueno tener un amigo informático!😊'   
                },
                {titulo:'💳 Facilidad de Pago:',
                descripcion:'Elige entre pagos semanales o mensuales. Adaptamos nuestras soluciones a tus necesidades financieras.'   
                },
            ]
        },
        planes: [
            {
              name: 'Redes Sociales',
              firstWeekPrice: 120,
              subsequentWeeksPrice: 85,
              description: 'Gestión de Redes Sociales: Facebook, Instagram, Google My Business y Tripadvisor',
              features: ['2-3 post semanales', 'Alcance 13.000 Personas', 'Clicks 25', 'Gestión de Reseñas', '* Servicion Informático sin coste adicional'],
              checkbox:true
            },
            {
              name: 'Redes + Pagina Web',
              firstWeekPrice: 150,
              subsequentWeeksPrice: 100,
              description: 'Gestión de Redes Sociales + Creación y Gestión de página Web',
              features: ['2-3 post semanales', 'Alcance 13.000 Personas', 'Clicks 25', 'Gestión de Reseñas', 'Diseño y Gestión de página Web', '* Dominio Gratuito', 'Alojamiento Web Gratuito', '* Servicion Informático sin coste adicional'],
              checkbox:true
            },
            {
              name: 'Servicio Informático',
              firstWeekPrice: 80,
        
              description: 'Translado + 1 hora de trabajo, luego 20€ hora hasta un máximo de 4 horas.',
              features: ['Asistencia Remota', 'Translado a Domicilio'],
              checkbox:false
            },
          ],
          vcard:{
            datos:[
              "BEGIN:VCARD",
              "VERSION:3.0",
              "N:Visconti;Javier;;;",
              "FN:Javier Visconti",
              "ORG:JV-Digital",
              "TITLE:Informática, Programación y Gestión Integral de Redes Sociales",
              "TEL;TYPE=WORK,VOICE:+34 648416513",
              "EMAIL:info.jv.digital@gmail.com",
              "ADR;TYPE=WORK:;;Calle Caracol nº3, Los Abrigos;Tenerife;;38618;España",
              "URL:https://jv-digital.com/",
              "END:VCARD"
            ],
            name:'Javier_Visconti.vcf'
          }
    },
    'en':{
        idioma:'en',
        agente:{
            nombre:nombre,
            puesto:'Computer Science, Programming and Social Media Management',
            email: email,
            asunto: 'JV-Digital Inquiry',
            tel: tel,
            direccion: direccion,
        },
        botones:{
            compartir:'Share',
            guardar:'Save',
            llamar:'Call'
        },
        servicios:{
            titulo:'Services',
            items: ['General Computer Science', 'Online Presence', 'Web Programming and Design', 'Creation and Management of Web Pages and Social Networks', 'Free Web Hosting']
        },
        clientes:'Our Clients',
        porQueElegirnos:{
            titulo:'Why Choose Us',
            items:[
                {
                 titulo:'🌐 Online Presence:',
                 descripcion:'Need to stand out on the web? We offer comprehensive social media management services, web page creation, and more.'   
                },
                {
                 titulo:'📱 Social Networks:',
                 descripcion:'We boost your presence on Facebook, Instagram, Google My Business, and TripAdvisor. Reach more customers and increase your sales.'   
                },
                {titulo:'💻 Computer Science Services:',
                descripcion:'Technical support, maintenance, and software development. It\'s always good to have a friend in computer science!😊'   
                },
                {titulo:'💳 Payment Flexibility:',
                descripcion:'Choose between weekly or monthly payments. We adapt our solutions to your financial needs.'   
                },
            ]
        },
        planes: [
            {
              name: 'Social Networks',
              firstWeekPrice: 120,
              subsequentWeeksPrice: 85,
              description: 'Social Media Management: Facebook, Instagram, Google My Business and Tripadvisor',
              features: ['2-3 posts per week', 'Reach 13,000 People', 'Clicks 25', 'Review Management', '* IT Service at no additional cost'],
              checkbox: true
            },
            {
              name: 'Networks + Website',
              firstWeekPrice: 150,
              subsequentWeeksPrice: 100,
              description: 'Social Media Management + Website Creation and Management',
              features: ['2-3 posts per week', 'Reach 13,000 People', 'Clicks 25', 'Review Management', 'Website Design and Management', '* Free Domain', 'Free Web Hosting', '* IT Service at no additional cost'],
              checkbox: true
            },
            {
              name: 'IT Service',
              firstWeekPrice: 80,
              description: 'Transfer + 1 hour of work, then €20 per hour up to a maximum of 4 hours.',
              features: ['Remote Assistance', 'Home Transfer'],
              checkbox: false
            },
          ],
          vcard:{
            datos:[
              "BEGIN:VCARD",
              "VERSION:3.0",
              "N:Visconti;Javier;;;",
              "FN:Javier Visconti",
              "ORG:JV-Digital",
              "TITLE:IT, Programming, and Comprehensive Social Media Management",
              "TEL;TYPE=WORK,VOICE:+34 648416513",
              "EMAIL:info.jv.digital@gmail.com",
              "ADR;TYPE=WORK:;;Calle Caracol nº3, Los Abrigos;Tenerife;;38618;España",
              "URL:https://jv-digital.com/",
              "END:VCARD"
            ],
            name:'Javier_Visconti.vcf'
          }
          
    },
    'it':{
        idioma:'it',
        agente:{
            nombre:'Javier Visconti',
            puesto:'Informatica, Programmazione e Gestione Integrale dei Social Media',
            email: email,
            asunto: 'Richiesta di JV-Digital',
            tel: tel,
            direccion: direccion,
        },
        botones:{
            compartir:'Condividi',
            guardar:'Salva',
            llamar:'Chiama'
        },
        servicios:{
            titulo:'Servizi',
            items: ['Informatica Generale', 'Presenza Online', 'Programmazione e Design Web', 'Creazione e Gestione di Pagine Web e Social Network', 'Hosting Web Gratuito']
        },
        clientes:'I Nostri Clienti',
        porQueElegirnos:{
            titulo:'Perché Sceglierci',
            items:[
                {
                 titulo:'🌐 Presenza Online:',
                 descripcion:'Hai bisogno di distinguerti sul web? Offriamo servizi di gestione integrale dei social media, creazione di pagine web e altro.'   
                },
                {
                 titulo:'📱 Social Network:',
                 descripcion:'Potenziamo la tua presenza su Facebook, Instagram, Google My Business e TripAdvisor. Raggiungi più clienti e aumenta le tue vendite.'   
                },
                {titulo:'💻 Servizi di Informatica:',
                descripcion:'Supporto tecnico, manutenzione e sviluppo software. È sempre bello avere un amico informatico!😊'   
                },
                {titulo:'💳 Facilità di Pagamento:',
                descripcion:'Scegli tra pagamenti settimanali o mensili. Adattiamo le nostre soluzioni alle tue esigenze finanziarie.'   
                },
            ]
        },
        planes: [
            {
              name: 'Reti Sociali',
              firstWeekPrice: 120,
              subsequentWeeksPrice: 85,
              description: 'Gestione dei social media: Facebook, Instagram, Google My Business e Tripadvisor',
              features: ['2-3 post a settimana', 'Raggiungi 13.000 persone', 'Click 25', 'Gestione delle recensioni', '* Servizio informatico senza costi aggiuntivi'],
              checkbox: true
            },
            {
              name: 'Reti + Sito Web',
              firstWeekPrice: 150,
              subsequentWeeksPrice: 100,
              description: 'Gestione dei social media + Creazione e gestione del sito web',
              features: ['2-3 post a settimana', 'Raggiungi 13.000 persone', 'Click 25', 'Gestione delle recensioni', 'Progettazione e gestione del sito web', '* Dominio gratuito', 'Hosting web gratuito', '* Servizio informatico senza costi aggiuntivi'],
              checkbox: true
            },
            {
              name: 'Servizio Informatico',
              firstWeekPrice: 80,
              description: "Trasferimento + 1 ora di lavoro, poi €20 all'ora fino a un massimo di 4 ore.",
              features: ['Assistenza remota', 'Trasferimento a domicilio'],
              checkbox: false
            },
          ],
          vcard:{
            datos:[
              "BEGIN:VCARD",
              "VERSION:3.0",
              "N:Visconti;Javier;;;",
              "FN:Javier Visconti",
              "ORG:JV-Digital",
              "TITLE:Informatica, Programmazione e Gestione Integrale dei Social Media",
              "TEL;TYPE=WORK,VOICE:+34 648416513",
              "EMAIL:info.jv.digital@gmail.com",
              "ADR;TYPE=WORK:;;Calle Caracol nº3, Los Abrigos;Tenerife;;38618;España",
              "URL:https://jv-digital.com/",
              "END:VCARD"
            ],
            name:'Javier_Visconti.vcf'
          }
          
    }
}
