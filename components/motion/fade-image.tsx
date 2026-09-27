"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

/** next/image that fades in once decoded, instead of popping in over its placeholder. */
export function FadeImage({ className, onLoad, alt, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      {...props}
      alt={alt}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      className={cn("transition-opacity duration-slower ease-out", loaded ? "opacity-100" : "opacity-0", className)}
    />
  );
}
