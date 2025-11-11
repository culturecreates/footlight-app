import imageCompression from 'browser-image-compression';
import { message, Upload } from 'antd';
import i18n from 'i18next';

const hasTransparency = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 255) {
              resolve(true);
              return;
            }
          }

          resolve(false);
        } catch (error) {
          console.error('Error checking transparency:', error);
          resolve(false);
        }
      };

      img.onerror = () => {
        resolve(false);
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      resolve(false);
    };

    reader.readAsDataURL(file);
  });
};

export const beforeUpload = async (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error(i18n.t('dashboard.events.addEditEvent.otherInformation.image.subHeading'));
    return Upload.LIST_IGNORE;
  }

  try {
    const isTransparent = await hasTransparency(file);
    const dataUrl = await imageCompression.getDataUrlFromFile(file);
    const img = new Image();
    img.src = dataUrl;
    await new Promise((res) => (img.onload = res));

    const originalWidth = img.width;
    const originalHeight = img.height;
    const originalPixels = originalWidth * originalHeight;

    if (originalPixels > 1e7) {
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

      const compressedDataUrl = await imageCompression.getDataUrlFromFile(compressedFile);
      const compressedImg = new Image();
      compressedImg.src = compressedDataUrl;
      await new Promise((res) => (compressedImg.onload = res));

      compressedFile.width = compressedImg.width;
      compressedFile.height = compressedImg.height;
      compressedFile.isTransparent = isTransparent;

      return compressedFile;
    }

    file.width = originalWidth;
    file.height = originalHeight;
    file.isTransparent = isTransparent;

    return file;
  } catch (err) {
    console.error('Image compression failed:', err);
    return Upload.LIST_IGNORE;
  }
};
