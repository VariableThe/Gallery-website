"use client";

import { useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import { NextcloudFile } from "@/lib/nextcloud";
import "@/app/gallery.css";

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
        <div className="gallery-root">
          <RowsPhotoAlbum 
            photos={albumPhotos}
            targetRowHeight={350}
            spacing={4}
            onClick={({ index }) => setIndex(index)}
            render={{
              wrapper: ({ style, children }) => (
                <div 
                  style={style} 
                  className="custom-photo-wrapper relative overflow-hidden bg-muted cursor-pointer"
                >
                  {children}
                  <div className="rose-highlight" />
                </div>
              ),
              image: ({ alt, src, style }) => (
                <img
                  src={src}
                  alt={alt}
                  style={style}
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
        animation={{ swipe: 250, fade: 250 }}
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
