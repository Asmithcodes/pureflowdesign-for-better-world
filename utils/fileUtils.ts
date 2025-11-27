import { AttachedFile } from "../types";

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                return reject(new Error('FileReader did not return a string.'));
            }
            // The result is in the format "data:image/jpeg;base64,LzlqLzRBQ..."
            // We only want the part after the comma.
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
};

export const fileToAttachedFile = (file: File): Promise<AttachedFile> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                return reject(new Error('FileReader did not return a string.'));
            }
            const base64String = reader.result.split(',')[1];
            resolve({
                name: file.name,
                mimeType: file.type || 'application/octet-stream',
                data: base64String
            });
        };
        reader.onerror = error => reject(error);
    });
};

export const blobToAttachedFile = (blob: Blob, name: string, mimeType: string): Promise<AttachedFile> => {
     return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                return reject(new Error('FileReader did not return a string.'));
            }
            const base64String = reader.result.split(',')[1];
            resolve({
                name,
                mimeType,
                data: base64String
            });
        };
        reader.onerror = error => reject(error);
    });
}

export const svgToPngDataUrl = (svgString: string, scaleFactor: number = 2): Promise<string> => {
    return new Promise((resolve, reject) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
        const svgElement = svgDoc.querySelector('svg');

        if (!svgElement) {
            return reject("Could not parse SVG content.");
        }

        const viewBox = svgElement.getAttribute('viewBox');
        let width = 1920;
        let height = 1080;

        if (viewBox) {
            const parts = viewBox.split(' ').map(p => parseFloat(p));
            if (parts.length === 4 && !isNaN(parts[2]) && !isNaN(parts[3])) {
                width = parts[2];
                height = parts[3];
            }
        }
        
        svgElement.setAttribute('width', `${width}px`);
        svgElement.setAttribute('height', `${height}px`);
        
        const modifiedSvgString = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([modifiedSvgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width * scaleFactor;
            canvas.height = height * scaleFactor;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                return reject("Could not get canvas context");
            }

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const pngUrl = canvas.toDataURL('image/png');
            URL.revokeObjectURL(url);
            resolve(pngUrl);
        };
        
        img.onerror = (e) => {
            URL.revokeObjectURL(url);
            reject(new Error("Error loading SVG for PNG conversion."));
        };
        img.src = url;
    });
};