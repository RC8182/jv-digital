"use client";

import Anemometro from "./components/anemometer";


export default function Page({ params }) {
    const idioma= params.lang;
    

  return (
    <main>
        <Anemometro idioma={idioma}/>
    </main>
  );
}
