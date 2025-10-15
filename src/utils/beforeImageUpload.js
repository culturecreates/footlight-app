import imageCompression from 'browser-image-compression';

export const beforeUpload = async (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error(t('dashboard.events.addEditEvent.otherInformation.image.subHeading'));
    return Upload.LIST_IGNORE;
  }

  try {
    // Load image dimensions
    const dataUrl = await imageCompression.getDataUrlFromFile(file);
    const img = new Image();
    img.src = dataUrl;
    await new Promise((res) => (img.onload = res));

    const originalWidth = img.width;
    const originalHeight = img.height;
    const originalPixels = originalWidth * originalHeight;
    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    // Only resize if pixel count > 10^7
    if (originalPixels > 1e7) {
      // Scale factor to bring total pixels near 10^7
      const scaleFactor = Math.sqrt(1e7 / originalPixels);
      const targetWidth = Math.round(originalWidth * scaleFactor);
      const targetHeight = Math.round(originalHeight * scaleFactor);

      const options = {
        useWebWorker: true,
        maxWidthOrHeight: Math.max(targetWidth, targetHeight),
        initialQuality: 0.7,
        fileType: 'image/jpeg',
      };

      const compressedFile = await imageCompression(file, options);

      // Inspect resized file
      const compressedDataUrl = await imageCompression.getDataUrlFromFile(compressedFile);
      const compressedImg = new Image();
      compressedImg.src = compressedDataUrl;
      await new Promise((res) => (compressedImg.onload = res));

      const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);

      // Attach resized dimensions for later use
      compressedFile.width = compressedImg.width;
      compressedFile.height = compressedImg.height;

      // ✅ Return the new file — no mutation of originFileObj
      return compressedFile;
    }

    // Attach original dimensions
    file.width = originalWidth;
    file.height = originalHeight;

    // ✅ Return the original file untouched
    return file;
  } catch (err) {
    console.error('Image compression failed:', err);
    message.error('Image compression failed');
    return Upload.LIST_IGNORE;
  }
};
