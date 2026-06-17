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
            onClick={({ photo }) => setSelectedPhoto((photo as any).original)}
            render={{
              wrapper: ({ style, children }) => (
                <div 
                  style={style} 
                  className="relative overflow-hidden bg-muted transition-all duration-300 cursor-pointer group/photo"
                >
                  {children}
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/10 transition-colors duration-300 z-10 pointer-events-none" />
                </div>
              ),
              image: ({ alt, src, style }) => (
                <img
                  src={src}
                  alt={alt}
                  style={style}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/photo:scale-[1.02]"
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              className="absolute top-6 right-6 z-50 p-3 text-foreground/50 hover:text-foreground hover:bg-foreground/5 rounded-full transition-colors"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="w-6 h-6 stroke-[1.5]" />
            </button>

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative max-w-[95vw] max-h-[90vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.name}
                  className="max-w-full max-h-full object-contain rounded-md"
                  style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)" }}
                />
              </div>
              
              <div className="absolute -bottom-10 left-0 right-0 text-center text-sm font-medium text-foreground/40 tracking-wide">
                {selectedPhoto.name}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
