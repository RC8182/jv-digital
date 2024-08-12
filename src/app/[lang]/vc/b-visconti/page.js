import { VirtualCard } from "@/components/virtualCard/virtualCard";
import {data} from './db'

export default function Vcb({params}) {
  const idioma= params.lang;
  return (
    <div>
      <meta name="google-site-verification" content="6Wleb1gKWBvvhDhTruIXhwFweF4P7KhhoVpZ-UM1-y4" />
      <section className="bg-blue-900">
        <VirtualCard db={data[idioma]}/>
      </section>
    </div>
  );
}
