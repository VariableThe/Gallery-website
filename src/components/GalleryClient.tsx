"use client";

import { useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import { NextcloudFile } from "@/lib/nextcloud";

export default function GalleryClient({ photos }: { photos: NextcloudFile[] }) {
  const [index, setIndex] = useState(-1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const albumPhotos = photos.map(p => ({
    src: p.url,
    width: p.width || 600,
    height: p.height || 400,
    alt: p.name,
  }));

  return (
    <div className="w-full">
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h2 className="text-xl font-medium tracking-tight text-foreground">
            No photos found
          </h2>
          <p className="mt-4 text-sm opacity-50">
            Please check your Nextcloud connection.
          </p>
        </div>
      ) : (
        <div className="gallery-container">
          <RowsPhotoAlbum 
            photos={albumPhotos}
            targetRowHeight={350}
            spacing={4}
            onClick={({ index }) => setIndex(index)}
            render={{
              wrapper: (props, context) => {
                const { style, children, ...rest } = props;
                const photoIndex = context.index;
                const isHovered = hoveredIndex === photoIndex;
                const isAnyHovered = hoveredIndex !== null;
                const opacity = isAnyHovered && !isHovered ? 0.5 : 1;

                return (
                  <div 
                    {...rest}
                    style={{ ...style, opacity, transition: 'all 0.3s' }}
                    onMouseEnter={() => setHoveredIndex(photoIndex)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="relative overflow-hidden bg-muted cursor-pointer"
                  >
                    {children}
                    <div 
                      style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s' }}
                      className="absolute inset-0 bg-rose-500/25 z-10 pointer-events-none" 
                    />
                  </div>
                );
              },
              image: (props, context) => {
                const { alt, src, style, ...rest } = props;
                const isHovered = hoveredIndex === context.index;
                return (
                  <img
                    {...rest}
                    src={src}
                    alt={alt}
                    style={{ 
                      ...style, 
                      transform: isHovered ? 'scale(1.03)' : 'scale(1)', 
                      transition: 'transform 0.5s ease-out' 
                    }}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                );
              }
            }}
          />
        </div>
      )}

      {/* Advanced Lightbox */}
      <Lightbox
        slides={albumPhotos}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        plugins={[Fullscreen, Zoom]}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true,
        }}
      />
    </div>
  );
}
