/**
 * Utility helper for resizing, compressing, and encoding images to Base64
 * Ensures fast storage, crisp printing, and prevents localStorage quota overflow.
 */

export const compressAndResizeImage = (
  file: File,
  maxWidth = 400,
  maxHeight = 500,
  quality = 0.88
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Berkas yang dipilih harus berupa gambar (JPG, PNG, WebP)'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memproses data gambar'));
      img.onload = () => {
        let { width, height } = img;

        // Scale down proportionally
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw base64 if canvas is unavailable
          resolve(event.target?.result as string);
          return;
        }

        // Use high-quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Output as image/jpeg or image/png based on transparency
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputType, quality);
        resolve(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
