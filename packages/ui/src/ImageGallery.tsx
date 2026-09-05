"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";

export interface ImageGalleryProps {
  images: string[];
  alt?: string;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  showThumbnails?: boolean;
  aspectRatio?: "square" | "4:3" | "16:9" | "auto";
  enableZoom?: boolean;
  className?: string;
}

export function ImageGallery({
  images,
  alt = "Gallery image",
  currentIndex: controlledIndex = 0,
  onIndexChange,
  showThumbnails = true,
  aspectRatio = "square",
  enableZoom = true,
  className = "",
}: ImageGalleryProps) {
  const [localIndex, setLocalIndex] = useState(controlledIndex);
  const [zoomed, setZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const index = controlledIndex ?? localIndex;
  const setIndex = onIndexChange ?? setLocalIndex;

  const aspectClass = {
    square: "aspect-square",
    "4:3": "aspect-[4/3]",
    "16:9": "aspect-video",
    auto: "",
  }[aspectRatio];

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 1), 3));
  };

  const handlePan = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPan({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0.5, y: 0.5 });
  };

  const next = () => setIndex((index + 1) % images.length);
  const prev = () => setIndex((index - 1 + images.length) % images.length);

  return (
    <div className={["bhn-image-gallery", className].filter(Boolean).join(" ")}>
      <div className="bhn-image-gallery-main relative">
        <div
          className={`bhn-image-gallery-main-img ${aspectClass} overflow-hidden cursor-zoom-in`}
          style={{
            transformOrigin: `${pan.x * 100}% ${pan.y * 100}%`,
            transform: `scale(${zoomLevel})`,
            cursor: zoomLevel > 1 ? "grab" : "zoom-in",
            transition: zoomLevel > 1 ? "none" : "transform 0.2s ease",
          }}
          onClick={enableZoom && zoomLevel === 1 ? () => setZoomed(true) : undefined}
          onMouseMove={enableZoom && zoomLevel > 1 ? handlePan : undefined}
          onDoubleClick={enableZoom ? resetZoom : undefined}
        >
          <img
            src={images[index]}
            alt={`${alt} ${index + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow-md"
              onClick={prev}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow-md"
              onClick={next}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </Button>
          </>
        )}

        {showThumbnails && images.length > 1 && (
          <div className="bhn-image-gallery-thumbs flex flex-row gap-2 mt-3 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${alt} ${i + 1}`}
                className={`bhn-image-gallery-thumb ${i === index ? "active" : ""}`}
                onClick={() => setIndex(i)}
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>

      {zoomed && (
        <Modal
          open={zoomed}
          onClose={() => { setZoomed(false); resetZoom(); }}
          size="xl"
          closeable
        >
          <div className="relative h-[80vh]">
            <div
              className="w-full h-full overflow-hidden"
              style={{
                transformOrigin: `${pan.x * 100}% ${pan.y * 100}%`,
                transform: `scale(${zoomLevel})`,
                cursor: zoomLevel > 1 ? "grab" : "zoom-in",
              }}
              onMouseMove={handlePan}
              onDoubleClick={resetZoom}
              onWheel={(e) => {
                e.preventDefault();
                handleZoom(e.deltaY > 0 ? -0.1 : 0.1);
              }}
            >
              <img
                src={images[index]}
                alt={`${alt} ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleZoom(-0.2)}>
                <ChevronLeft size={16} /> Zoom Out
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleZoom(0.2)}>
                Zoom In <ChevronRight size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={resetZoom}>
                Reset
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 rounded-full bg-white/90 shadow-md"
              onClick={() => { setZoomed(false); resetZoom(); }}
              aria-label="Close zoom"
            >
              <X size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 rounded-full bg-white/90 shadow-md"
              onClick={prev}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-16 rounded-full bg-white/90 shadow-md"
              onClick={next}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}