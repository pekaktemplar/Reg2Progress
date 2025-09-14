import React from 'react';

export const ListNumberIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6h11M9 12h11M9 18h11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 7.5V6H3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3v1.5H3.75V15H6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17.25h3v.75H3.75v.75H6v.75H3" />
    </svg>
);