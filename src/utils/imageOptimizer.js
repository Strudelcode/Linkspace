/**
 * High-performance browser-side image optimizer using HTML5 Canvas.
 * Compresses and resizes images instantly to prevent large upload hangs and memory issues.
 */

export async function optimizeImage(file, {
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85,
  mimeType = 'image/webp'
} = {}) {
  if (!file) throw new Error('Keine Datei übergeben.');

  // If already SVG or animated GIF, we can preserve if small or convert
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: reader.result, blob: file });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Fehler beim Lesen der Bilddatei.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Bildformat wird vom Browser nicht unterstützt.'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Downsample if dimensions exceed constraints
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.max(1, Math.round(width * ratio));
            height = Math.max(1, Math.round(height * ratio));
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ dataUrl: event.target.result, blob: file });
            return;
          }

          // High quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(img, 0, 0, width, height);

          // Try webp first, fallback to jpeg if not supported
          let targetMime = mimeType;
          let dataUrl = canvas.toDataURL(targetMime, quality);

          // If webp is not supported by browser it might fallback to png which is large, check and use jpeg
          if (targetMime === 'image/webp' && dataUrl.startsWith('data:image/png') && file.type !== 'image/png') {
            targetMime = 'image/jpeg';
            dataUrl = canvas.toDataURL(targetMime, quality);
          }

          // Generate Blob for potential storage upload
          canvas.toBlob(
            (blob) => {
              resolve({
                dataUrl,
                blob: blob || file,
                width,
                height
              });
            },
            targetMime,
            quality
          );
        } catch (err) {
          // Fallback to original read
          resolve({ dataUrl: event.target.result, blob: file });
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Avatar optimizer: max 400x400 px, compact WebP/JPEG (~20-40 KB)
 */
export async function optimizeAvatarImage(file) {
  return optimizeImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.85,
    mimeType: 'image/webp'
  });
}

/**
 * Background optimizer: max 1920x1080 px, compact WebP/JPEG (~100-250 KB)
 */
export async function optimizeBackgroundImage(file) {
  return optimizeImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.82,
    mimeType: 'image/webp'
  });
}

/**
 * Link icon optimizer: max 160x160 px, compact WebP/PNG (~10 KB)
 */
export async function optimizeLinkIcon(file) {
  return optimizeImage(file, {
    maxWidth: 160,
    maxHeight: 160,
    quality: 0.9,
    mimeType: 'image/webp'
  });
}
