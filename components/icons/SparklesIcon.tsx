import React from 'react';

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M2.25 12a8.96 8.96 0 0 1 0-1.591m19.5 1.591a8.96 8.96 0 0 0 0-1.591M12 21a8.96 8.96 0 0 0 0-1.591m0 1.591a8.96 8.96 0 0 1 0-1.591M21 12a8.96 8.96 0 0 0-1.591-6.745M3 12a8.96 8.96 0 0 1 1.591-6.745m14.82 0a8.96 8.96 0 0 1-1.591 6.745M12 3v2.25m0 16.5V21m0-9-1.591-1.591M12 12l1.591 1.591M12 12L9.75 9.75M12 12l2.25 2.25M12 12l-2.25 2.25M12 12l2.25-2.25" />
    </svg>
);

export default SparklesIcon;
