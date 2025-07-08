import { useLayoutEffect, useState } from 'react';

// Este hook ajusta el tamaño de la fuente para que el texto quepa en su contenedor.
export const useFitText = (text, initialSize = 20) => {
  const [fontSize, setFontSize] = useState(initialSize);
  const [ref, setRef] = useState(null);

  useLayoutEffect(() => {
    if (!ref) return;

    const hasOverflow = ref.scrollWidth > ref.clientWidth || ref.scrollHeight > ref.clientHeight;

    if (hasOverflow) {
      setFontSize((prevSize) => prevSize * 0.9); // Reduce el tamaño
    }
  }, [ref, text, fontSize]); // Se re-ejecuta si el texto o el tamaño cambian

  return { fontSize: `${fontSize}px`, ref: setRef };
};
