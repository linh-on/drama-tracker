'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Tag } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-[rgba(0,0,0,0.06)] z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4a5a5] to-[#c8a2c8] flex items-center justify-center">
            <span className="text-white text-sm">📺</span>
          </div>
          <h1 className="text-xl tracking-tight">DramaLog</h1>
        </div>

        {/* Nav links */}
        <div className="flex gap-2">
          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              pathname === '/' ? 'bg-[#d4a5a5] text-white' : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Home size={18} />
            <span className="text-sm">Home</span>
          </Link>

          <Link
            href="/list"
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              pathname === '/list' ? 'bg-[#d4a5a5] text-white' : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <List size={18} />
            <span className="text-sm">My List</span>
          </Link>

          <Link
            href="/keywords"
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              pathname === '/keywords' ? 'bg-[#d4a5a5] text-white' : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Tag size={18} />
            <span className="text-sm">Keywords</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}