import React, { useState, useEffect, useRef } from 'react';

import { API_BASE_URL } from '../../constants/index.jsx';
const VerticalProductCarousel = ({ id, title, mainImage, additionalImages, selectedFlavorId }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const thumbScrollRef = useRef(null);

  // Helper to resolve database image URLs
  const resolveUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('/')) return url;
    return `${API_BASE_URL}/${url}`;
  };

  // Robust image processing with Flavor Filtering
  const images = [];

  // Always include main image (default)
  if (mainImage) images.push(resolveUrl(mainImage));

  if (Array.isArray(additionalImages)) {
    additionalImages.forEach(imgData => {
      const imgUrl = typeof imgData === 'string' ? imgData : (imgData.url || imgData.image);
      const flavorId = imgData.flavor_id;

      // Filter logic:
      // If a flavor is selected, only show images matching that flavor OR the main image
      // If no flavor is selected, show everything
      if (!selectedFlavorId || flavorId == selectedFlavorId) {
        if (imgUrl) images.push(resolveUrl(imgUrl));
      }
    });
  }

  // Deduplicate and filter empty
  const uniqueImages = Array.from(new Set(images)).filter(Boolean);

  // If no images, add a fallback for better UI
  if (uniqueImages.length === 0) {
    uniqueImages.push(`https://picsum.photos/seed/${id || 'product'}/800/800`);
  }

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % uniqueImages.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length);

  useEffect(() => {
    if (thumbScrollRef.current) {
      const activeThumb = thumbScrollRef.current.children[activeIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return (
    <div className="flex flex-row gap-5 w-full bg-white p-2" style={{ height: '600px' }}>

      {/* 1. LEFT SIDE: VERTICAL THUMBNAILS (Strictly 100x100) */}
      <div
        className="flex flex-col gap-3 overflow-y-auto no-scrollbar flex-shrink-0 pr-2 border-r border-slate-50"
        style={{ width: '110px', height: '100%' }}
      >
        <div ref={thumbScrollRef} className="flex flex-col gap-3">
          {uniqueImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-[100px] h-[150px] rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeIndex === idx
                ? 'border-sky-500 ring-4 ring-sky-100 shadow-xl scale-105 z-10'
                : 'border-slate-100 opacity-80 hover:opacity-100 hover:border-slate-300 shadow-sm'
                }`}
            >
              <img
                src={img}
                alt={`${title} thumb ${idx}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const currentSrc = e.target.src;
                  if (currentSrc.includes('/images/') && !currentSrc.includes('/images/products/')) return;

                  if (currentSrc.includes('localhost:3000/')) {
                    const newUrl = currentSrc.replace('/images/products/', '/images/').replace('/uploads/products/', '/images/');
                    if (newUrl !== currentSrc) e.target.src = newUrl;
                  }
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 2. RIGHT SIDE: MAIN IMAGE DISPLAY */}
      <div className="relative flex-grow bg-slate-50/50 rounded-[2.5rem] border border-slate-100 overflow-hidden group">

        {/* Navigation Arrows (Always visible) */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-2xl text-slate-800 hover:bg-sky-500 hover:text-white transition-all duration-300 border border-slate-100 active:scale-90"
          aria-label="Previous Slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-2xl text-slate-800 hover:bg-sky-500 hover:text-white transition-all duration-300 border border-slate-100 active:scale-90"
          aria-label="Next Slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>

        {/* Zoom Button (Top Right) */}
        <button
          onClick={() => setIsFullScreen(true)}
          className="absolute top-8 right-8 z-30 w-14 h-14 flex items-center justify-center bg-white/95 backdrop-blur-lg rounded-full shadow-2xl text-slate-900 hover:bg-sky-500 hover:text-white transition-all duration-300 border border-slate-100 active:scale-90"
          title="Full Resolution View"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 3 6 6M9 21l-6-6M21 3l-6 6M3 21l6-6" /></svg>
        </button>

        {/* Main Image View */}
        <div className="w-full h-full flex items-center justify-center p-8 sm:p-14">
          <img
            key={uniqueImages[activeIndex]}
            src={uniqueImages[activeIndex]}
            alt={title}
            className="max-w-full max-h-full object-contain animate-fadeIn"
            onError={(e) => {
              if (!e.target.src.includes('/uploads/')) {
                e.target.src = e.target.src.replace('localhost:3000/', 'localhost:3000/uploads/');
              }
            }}
          />
        </div>

        {/* Progress Decoration */}
        <div className="absolute top-10 left-10 flex items-center gap-2">
          <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{activeIndex + 1}</span>
          <div className="w-12 h-[1.5px] bg-slate-100 overflow-hidden rounded-full">
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{ width: `${((activeIndex + 1) / uniqueImages.length) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{uniqueImages.length}</span>
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[99999] bg-slate-950 flex items-center justify-center p-4 backdrop-blur-xl">
          <button
            onClick={() => setIsFullScreen(false)}
            className="absolute top-10 right-10 w-16 h-16 flex items-center justify-center bg-white/5 hover:bg-rose-500 rounded-full text-white transition-all duration-300 border border-white/10 shadow-2xl group"
          >
            <svg className="transition-transform group-hover:rotate-90" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>

          <div className="w-full h-full flex items-center justify-center p-8">
            <img
              src={uniqueImages[activeIndex]}
              alt={title}
              className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
            />
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fadeIn {
          from { opacity: 0; filter: blur(10px); }
          to { opacity: 1; filter: blur(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default VerticalProductCarousel;
