import React from 'react';

const SandClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h13.5m-13.5 7.5h13.5m-1.875-7.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm-9 7.5a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25v-1.5A2.25 2.25 0 0 1 7.5 4.5h9A2.25 2.25 0 0 1 18.75 6.75v1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 15.75v1.5A2.25 2.25 0 0 0 7.5 19.5h9a2.25 2.25 0 0 0 2.25-2.25v-1.5" />
    </svg>
);

export default SandClockIcon;
