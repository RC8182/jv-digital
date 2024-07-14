import React from 'react';
import Link from 'next/link';

export const WhatsApp = ({numero}) => {
  return (
        <Link
        className="text-white"  target="_blank" rel="noopener noreferrer"
        href= {`https://api.whatsapp.com/send/?phone=${numero}`}
        passHref>
            WhatsApp
        </Link>
  );
};
