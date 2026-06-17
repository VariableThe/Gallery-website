import { fetchPhotos } from "@/lib/nextcloud";
import GalleryClient from "@/components/GalleryClient";

export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  const photos = await fetchPhotos();

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center bg-background">
      <div className="w-full flex flex-col items-center pt-16 pb-12 px-6">
        {/* Minimal Header */}
        <div className="w-full max-w-screen-2xl flex flex-row items-center justify-between mb-12">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Gallery
          </h1>
          <p className="text-sm font-medium text-foreground/50 tracking-wider uppercase">
            {photos.length} Photos
          </p>
        </div>

        {/* Client Gallery Grid */}
        <div className="w-full max-w-screen-2xl">
          <GalleryClient photos={photos} />
        </div>
      </div>
    </main>
  );
}
