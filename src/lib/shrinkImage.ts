/** Square-crop and shrink a picked photo to a 400px JPEG in the browser, so phone photos fit the 2 MB upload limit */
export const shrinkImage = (file: File) => new Promise<Blob>((resolve, reject) => {
  const img = new Image();
  img.onload = () => {
    const s = Math.min(img.width, img.height), c = document.createElement('canvas');
    c.width = c.height = Math.min(400, s);
    c.getContext('2d')!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, c.width, c.height);
    URL.revokeObjectURL(img.src);
    c.toBlob(b => (b ? resolve(b) : reject(new Error('تعذر قراءة الصورة'))), 'image/jpeg', 0.88);
  };
  img.onerror = () => reject(new Error('الملف ليس صورة صالحة'));
  img.src = URL.createObjectURL(file);
});
