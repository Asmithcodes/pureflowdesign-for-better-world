import React, { useEffect, useRef, useState, useMemo } from 'react';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';


interface InteractivePfdProps {
    svgContent: string;
}

const InteractivePfd: React.FC<InteractivePfdProps> = ({ svgContent }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [selectedElement, setSelectedElement] = useState<{ id: string; title: string | null } | null>(null);

    // State for popup
    const popupRef = useRef<HTMLDivElement>(null);
    const [popupPosition, setPopupPosition] = useState<{ top: number; left: number | string; right: number | string }>({ top: 8, left: 'auto', right: 8 });
    const dragInfo = useRef({ isDragging: false, startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });

    // State for zoom and pan
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const isPanning = useRef(false);
    const panStart = useRef({ x: 0, y: 0 });

    // Memoize parsed SVG content to avoid re-parsing on every render
    const { viewBox, innerContent } = useMemo(() => {
        if (!svgContent) return { viewBox: '0 0 1000 750', innerContent: '' };
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
        const svgElement = svgDoc.querySelector('svg');
        const vb = svgElement?.getAttribute('viewBox') || '0 0 1000 750';
        // Serialize children to string to use with dangerouslySetInnerHTML
        const content = Array.from(svgElement?.children || []).map(child => child.outerHTML).join('');
        return { viewBox: vb, innerContent: content };
    }, [svgContent]);


    const handleZoom = (factor: number, centerX?: number, centerY?: number) => {
        setTransform(prev => {
            const newScale = Math.max(0.1, Math.min(10, prev.scale * factor));
            
            if (!svgRef.current) return { ...prev, scale: newScale };
            
            const svgRect = svgRef.current.getBoundingClientRect();
            const cx = centerX ?? svgRect.width / 2;
            const cy = centerY ?? svgRect.height / 2;
            
            // The point in the SVG coordinate system that should stay under the cursor
            const pointX = (cx - prev.x) / prev.scale;
            const pointY = (cy - prev.y) / prev.scale;

            // The new pan coordinates
            const newX = cx - pointX * newScale;
            const newY = cy - pointY * newScale;
            
            return { scale: newScale, x: newX, y: newY };
        });
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        handleZoom(factor, e.clientX - e.currentTarget.getBoundingClientRect().left, e.clientY - e.currentTarget.getBoundingClientRect().top);
    };

    const handleMouseDownPan = (e: React.MouseEvent) => {
        // Prevent pan when clicking on interactive elements
        const target = e.target as SVGElement;
        if (target.closest('.equipment-unit')) {
            return;
        }
        isPanning.current = true;
        panStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
        if (svgRef.current) {
            svgRef.current.style.cursor = 'grabbing';
        }
    };
    
    const handleMouseMovePan = (e: React.MouseEvent) => {
        if (!isPanning.current) return;
        setTransform(prev => ({
            ...prev,
            x: e.clientX - panStart.current.x,
            y: e.clientY - panStart.current.y
        }));
    };
    
    const handleMouseUpPan = () => {
        isPanning.current = false;
        if (svgRef.current) {
            svgRef.current.style.cursor = 'grab';
        }
    };

    const handleResetView = () => {
        setTransform({ scale: 1, x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!popupRef.current || !popupRef.current.parentElement) return;
        const rect = popupRef.current.getBoundingClientRect();
        const parentRect = popupRef.current.parentElement.getBoundingClientRect();
        dragInfo.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            initialTop: rect.top - parentRect.top,
            initialLeft: rect.left - parentRect.left,
        };
        setPopupPosition({
            top: dragInfo.current.initialTop,
            left: dragInfo.current.initialLeft,
            right: 'auto',
        });
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!dragInfo.current.isDragging) return;
        const dx = e.clientX - dragInfo.current.startX;
        const dy = e.clientY - dragInfo.current.startY;
        setPopupPosition({
            top: dragInfo.current.initialTop + dy,
            left: dragInfo.current.initialLeft + dx,
            right: 'auto',
        });
    };

    const handleMouseUp = () => {
        dragInfo.current.isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        const equipmentUnits = svg.querySelectorAll('.equipment-unit');

        const handleElementClick = (event: Event) => {
            event.stopPropagation();
            const target = event.currentTarget as SVGGElement;
            const id = target.id;
            const title = target.querySelector('title')?.textContent ?? null;
            setSelectedElement({ id, title });
            equipmentUnits.forEach(unit => unit.classList.remove('selected-unit'));
            target.classList.add('selected-unit');
        };
        
        const handleSvgClick = (e: MouseEvent) => {
            // Only deselect if the click is on the SVG background, not on a component
            if (e.target === svg) {
                setSelectedElement(null);
                equipmentUnits.forEach(unit => unit.classList.remove('selected-unit'));
            }
        };

        equipmentUnits.forEach(unit => unit.addEventListener('click', handleElementClick));
        svg.addEventListener('click', handleSvgClick);
        svg.style.cursor = 'grab';

        return () => {
            equipmentUnits.forEach(unit => unit.removeEventListener('click', handleElementClick));
            if (svg) {
                svg.removeEventListener('click', handleSvgClick);
            }
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [innerContent]); // Re-attach listeners when SVG content changes

    const interactiveStyles = `
        .equipment-unit {
            cursor: pointer;
            transition: stroke 0.2s ease-in-out, stroke-width 0.2s ease-in-out;
            transform-box: fill-box;
            transform-origin: center;
        }
        .equipment-unit:hover > * {
            stroke: #2563eb; /* blue-600 */
            stroke-width: 2.5px;
        }
        .equipment-unit.selected-unit > * {
            stroke: #db2777; /* pink-600 */
            stroke-width: 2.5px;
        }
        @keyframes pulse-effect {
            0%, 100% {
                transform: scale(1);
                filter: drop-shadow(0 0 5px rgba(219, 39, 119, 0.7));
            }
            50% {
                transform: scale(1.03);
                filter: drop-shadow(0 0 12px rgba(219, 39, 119, 1));
            }
        }
        .equipment-unit.selected-unit {
            animation: pulse-effect 2.5s infinite ease-in-out;
        }
        @keyframes flow-effect {
            to { stroke-dashoffset: -24; }
        }
        .pipe-flow {
            stroke-dasharray: 8 16;
            animation: flow-effect 1.5s linear infinite;
            stroke-width: 1.5px;
            stroke: #9ca3af;
        }
        .dark .pipe-flow { stroke: #64748b; }
    `;

    return (
        <div className="relative">
            <style>{interactiveStyles}</style>
            
            <div 
                ref={containerRef}
                className="w-full h-auto overflow-hidden border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                onWheel={handleWheel}
                onMouseDown={handleMouseDownPan}
                onMouseMove={handleMouseMovePan}
                onMouseUp={handleMouseUpPan}
                onMouseLeave={handleMouseUpPan} // Stop panning if mouse leaves container
            >
                <svg
                    ref={svgRef}
                    viewBox={viewBox}
                    width="100%"
                    height="100%"
                >
                    <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}
                       dangerouslySetInnerHTML={{ __html: innerContent }}
                    />
                </svg>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col space-y-1">
                <button onClick={() => handleZoom(1.2)} className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md" aria-label="Zoom in">
                    <PlusIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleZoom(1 / 1.2)} className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md" aria-label="Zoom out">
                    <MinusIcon className="w-5 h-5" />
                </button>
                <button onClick={handleResetView} className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md" aria-label="Reset view">
                    <ArrowPathIcon className="w-5 h-5" />
                </button>
            </div>

            {selectedElement && (
                <div
                    ref={popupRef}
                    className="absolute bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-w-xs animate-fade-in"
                    style={{
                        top: `${popupPosition.top}px`,
                        left: popupPosition.left === 'auto' ? 'auto' : `${popupPosition.left}px`,
                        right: popupPosition.right === 'auto' ? 'auto' : `${popupPosition.right}px`,
                    }}
                >
                    <div 
                        className="cursor-move pb-3 mb-3 border-b border-slate-300 dark:border-slate-600 select-none"
                        onMouseDown={handleMouseDown}
                    >
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 pointer-events-none">Selected Component</h4>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">ID: <code className="bg-slate-100 dark:bg-slate-700 rounded px-1 text-pink-600">{selectedElement.id}</code></p>
                    {selectedElement.title && (
                         <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            <strong>Description:</strong> {selectedElement.title}
                        </p>
                    )}
                    <button className="mt-4 w-full text-sm bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Refine Details (Coming Soon)
                    </button>
                </div>
            )}
        </div>
    );
};

export default InteractivePfd;
