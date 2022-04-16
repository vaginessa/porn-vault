import { useState } from "react";
import Lightbox from "./Lightbox";

type Props = {
  src: string;
  fullSrc: string;
  alt?: string;
};

export default function ImageCard({ alt, src, fullSrc }: Props) {
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      <img
        width="100%"
        src={src}
        alt={alt}
        onClick={() => {
          setLightbox(true);
        }}
      />
      <Lightbox
        onClose={() => {
          setLightbox(false);
        }}
        src={fullSrc}
        alt={alt}
        active={lightbox}
      />
    </>
  );
}
