// Shrinks a photo on the phone before it is sent to the AI: small enough to
// upload quickly, still sharp enough to read book text.

// The size that fits inside max × max, keeping the aspect ratio; never larger than the original.
export function fitSize(w, h, max = 1600) {
  const scale = Math.min(1, max / Math.max(w, h));
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
}

// file: an image File from <input type="file">. Returns { data: base64 without the data: prefix, mimeType }.
export async function shrinkPhoto(file, max = 1600, quality = 0.85) {
  const bitmap = await createImageBitmap(file); // applies the photo's EXIF rotation
  const { w, h } = fitSize(bitmap.width, bitmap.height, max);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not shrink the photo.'))), 'image/jpeg', quality),
  );
  const url = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return { data: String(url).slice(String(url).indexOf(',') + 1), mimeType: 'image/jpeg' };
}
