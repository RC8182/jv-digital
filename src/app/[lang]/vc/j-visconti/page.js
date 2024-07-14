import { VirtualCard } from "@/components/virtualCard/virtualCard";
import {data} from './db'

export default function Vcj({params}) {
  const idioma= params.lang;
  return (
    <div>
      <meta name="google-site-verification" content="6Wleb1gKWBvvhDhTruIXhwFweF4P7KhhoVpZ-UM1-y4" />
      <VirtualCard db={data[idioma]}/>
    </div>
  );
}
