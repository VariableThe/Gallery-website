"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import { NextcloudFile } from "@/lib/nextcloud";

export default function GalleryClient({ photos }: { photos: NextcloudFile[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<NextcloudFile | null>(null);

  const albumPhotos = photos.map(p => ({
    src: p.url,
    width: p.width || 600,
    height: p.height || 400,
    alt: p.name,
    original: p // keep original for lightbox
  }));

  return (
    <div className="w-full">
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-foreground p5-skew sketch-border px-8 py-4 bg-background/90 p5-shadow">
            No photos found
          </h2>
          <p className="mt-8 opacity-70">
            Please check your Nextcloud share token and try again.
          </p>
        </div>
      ) : (
        <div className="gallery-container">
          <RowsPhotoAlbum 
            photos={albumPhotos}
            targetRowHeight={300}
            onClick={({ photo }) => setSelectedPhoto((photo as any).original)}
            render={{
              wrapper: ({ style, children }) => (
                <div 
                  style={style} 
                  className="relative group overflow-hidden sketch-border-thin bg-background transition-all duration-300 hover:z-10 hover:p5-shadow hover:-translate-y-1 cursor-pointer"
                >
                  {children}
                </div>
              ),
              image: ({ alt, src, style }) => (
                <img
                  src={src}
                  alt={alt}
                  style={style}
                  className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                  loading="lazy"
                />
              )
            }}
          />
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 z-50 p-2 bg-primary text-primary-foreground sketch-border hover:scale-110 transition-transform"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="relative w-full h-full sketch-border bg-foreground/5 p-2 shadow-2xl flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.name}
                  className="max-w-full max-h-full object-contain p5-shadow"
                />
              </div>
              
              <div className="mt-4 bg-foreground text-background sketch-border px-6 py-2 uppercase font-bold text-sm tracking-widest p5-skew">
                {selectedPhoto.name}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
