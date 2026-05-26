import { useState } from 'react';

export default function ResponsiveImage({ candidates, alt, className, style }) {
  const list = Array.isArray(candidates) ? candidates : [candidates];
  const [index, setIndex] = useState(0);
  const src = list[index] ?? list[list.length - 1];

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={() => {
        if (index < list.length - 1) setIndex((i) => i + 1);
      }}
    />
  );
}
