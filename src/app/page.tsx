import { fetchPhotos } from "@/lib/nextcloud";
import GalleryClient from "@/components/GalleryClient";

export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  const photos = await fetchPhotos();

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col items-center p-8 bg-background">
      {/* Da Vinci sketch / grid background layout */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-5 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, var(--color-foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--color-foreground) 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-7xl mt-12 mb-16 gap-12">
        {/* Header */}
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <h1 className="text-5xl md:text-8xl font-black uppercase leading-none tracking-tighter text-foreground p5-skew px-8 py-6 sketch-border bg-background/90 backdrop-blur-md p5-shadow">
              Gallery
            </h1>
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-primary text-primary-foreground text-xl md:text-2xl font-black uppercase p-3 md:p-4 sketch-border shadow-xl rotate-[4deg] hover:rotate-[2deg] transition-all cursor-default whitespace-nowrap">
              Visuals
            </div>
          </div>
        </div>

        {/* Client Gallery Grid */}
        <GalleryClient photos={photos} />
      </div>
      
      {/* Decorative Technical Text - Da Vinci notes vibe */}
      <div className="fixed bottom-8 left-8 text-xs font-mono opacity-50 uppercase tracking-[0.2em] hidden md:block z-0 pointer-events-none">
        // FIG. 2 - LIGHTBOX METRICS<br />
        SOURCE: nc.vrbl.win
      </div>
    </main>
  );
}
