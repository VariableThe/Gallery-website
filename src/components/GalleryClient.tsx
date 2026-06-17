"use client";

import React, { useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import { NextcloudFile } from "@/lib/nextcloud";

function InteractivePhoto({ wrapperProps }: { wrapperProps: any }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      {...wrapperProps}
      onMouseEnter={(e) => {
        setHovered(true);
        wrapperProps.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        wrapperProps.onMouseLeave?.(e);
      }}
      style={{
        ...wrapperProps.style,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        zIndex: hovered ? 10 : 1,
      }}
      className={wrapperProps.className || ""}
    >
      {React.cloneElement(wrapperProps.children as React.ReactElement, {
        style: {
          ...(wrapperProps.children as React.ReactElement).props.style,
          transition: "transform 0.4s ease-out",
          transform: hovered ? "scale(1.05)" : "scale(1)",
        }
      })}

      {/* Rose Tint Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(244, 63, 94, 0.4)",
          mixBlendMode: "multiply",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
      {/* Rose Border */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          border: "4px solid #f43f5e",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
          zIndex: 20,
        }}
      />
    </div>
  );
}

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
        <div className="gallery-container">
          <RowsPhotoAlbum 
            photos={albumPhotos}
            targetRowHeight={350}
            spacing={4}
            onClick={({ index }) => setIndex(index)}
            render={{
              wrapper: (props) => <InteractivePhoto wrapperProps={props} />
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
