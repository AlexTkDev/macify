import type { ImageLoaderProps } from "next/image";

export default function mediaImageLoader({ src, width }: ImageLoaderProps) {
  if (!src.startsWith("/media/")) return src;

  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}width=${width}`;
}
