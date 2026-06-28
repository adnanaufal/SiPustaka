import React from 'react';
import { BookOpen } from 'lucide-react';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 warm-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-40 border-2 border-white/30 rounded-lg rotate-12" />
          <div className="absolute top-40 right-20 w-24 h-32 border-2 border-white/20 rounded-lg -rotate-6" />
          <div className="absolute bottom-32 left-32 w-28 h-36 border-2 border-white/25 rounded-lg rotate-3" />
          <div className="absolute bottom-20 right-10 w-20 h-28 border-2 border-white/15 rounded-lg -rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <BookOpen className="h-10 w-10" />
            </div>
            <span className="font-serif text-4xl font-bold">SiPustaka</span>
          </div>
          <h1 className="text-3xl font-serif font-bold mb-4 leading-tight">
            Dunia Literasi<br />di Ujung Jari Anda
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-md">
            Kelola toko buku dengan mudah. Jelajahi katalog, belanja online, dan lacak pesanan — semua dalam satu platform.
          </p>
          <div className="mt-12 flex gap-8">
            <div>
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-sm text-white/60">Judul Buku</div>
            </div>
            <div>
              <div className="text-3xl font-bold">5</div>
              <div className="text-sm text-white/60">Toko Fisik</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-white/60">Akses Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface-50 dark:bg-primary-950">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
