import React from 'react';
import Link from 'next/link';

export const Llamar = ({title, numero}) => {
  return (
    <div>
        <Link href={`tel:${numero}`} passHref>
          {title}
        </Link>
    </div>
  );
};
