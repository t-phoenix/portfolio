import type { StaticImageData } from 'next/image';

export function getImageSrc(image: string | StaticImageData): string {
  if (typeof image === 'string') {
    return image;
  }
  return image.src;
}
