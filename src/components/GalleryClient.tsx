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
        <div className="gallery-container group/gallery">
          <RowsPhotoAlbum 
            photos={albumPhotos}
            targetRowHeight={350}
            spacing={4}
            onClick={({ index }) => setIndex(index)}
            render={{
              wrapper: ({ style, children }) => (
                <div 
                  style={style} 
                  className="relative overflow-hidden bg-muted transition-all duration-300 cursor-pointer group/photo"
                >
                  {children}
                  {/* Subtle rose tint overlay on hover */}
                  <div className="absolute inset-0 bg-rose-500/0 mix-blend-overlay group-hover/photo:bg-rose-500/30 transition-all duration-500 z-10 pointer-events-none" />
                  <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/5 transition-colors duration-500 z-10 pointer-events-none" />
                </div>
              ),
              image: ({ alt, src, style }) => (
                <img
                  src={src}
                  alt={alt}
                  style={style}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/photo:scale-105"
                  loading="lazy"
                />
              )
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
