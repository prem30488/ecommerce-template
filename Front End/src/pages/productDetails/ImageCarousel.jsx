import React, { useState, useRef } from 'react';
import { COMPANY_INFO } from '../../constants/companyInfo';
// Import Swiper styles
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';

import './styles.css';
import { Navigation } from 'swiper/modules';
import { useId } from 'react'

const ImageCarousel = ({ id, title, mainImage, additionalImages, imageList, thumbs = true, thumbDirection = 'horizontal', style, className }) => {
  const uId = useId();
  const mainSwiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  let images = [mainImage].filter(Boolean);
  if (imageList) {
    const list = typeof imageList === 'string' ? imageList.split(',').map(s => s.trim()).filter(Boolean) : imageList;
    images = [...images, ...list];
  }
  if (additionalImages && Array.isArray(additionalImages)) {
    images = [...images, ...additionalImages.map(img => img?.url || img).filter(Boolean)];
  }

  // deduplicate and filter
  images = Array.from(new Set(images)).filter(img => img && typeof img === 'string');

  // Only use filler images if NO real images were found at all
  if (images.length === 0) {
    for (let i = 0; i < 5; i++) {
      images.push(`https://picsum.photos/seed/${encodeURIComponent(id)}-${i}/900/600`);
    }
  }

  // Deduplicate in case there are duplicates (not required, but safer)
  images = Array.from(new Set(images));

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center p-10 bg-gray-200 rounded-lg text-gray-500 ${className || ''}`} style={style}>
        No images available
      </div>
    );
  }

  return (
    <div className={`product-carousel-container flex ${thumbDirection === 'vertical' ? 'flex-row' : 'flex-col'} ${className || ''}`} style={{ minHeight: '100%', alignItems: 'flex-start', overflow: 'hidden', ...style }}>

      {/* Vertical Thumbs (Left side) */}
      {thumbs && thumbDirection === 'vertical' && (
        <div className="thumbs-scroll flex flex-col gap-2 pr-2" style={{ height: '100px', maxHeight: '100%', overflowY: 'hidden', overflowX: 'hidden' }}>
          {images.map((imageUrl, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${uId}-thumb-button-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  mainSwiperRef.current?.slideTo(index);
                  setActiveIndex(index);
                }}
                className="shrink-0 p-0 border-0 bg-transparent cursor-pointer flex-none"
                style={{
                  width: '100px',
                  height: '100px',
                  opacity: isActive ? 1 : 0.4,
                  transform: isActive ? 'scale(1.04)' : 'scale(1)',
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                }}
              >
                <img
                  src={imageUrl.includes('/images/') ? '/images/' + imageUrl.split('/images/')[1] : imageUrl}
                  alt={`${title || 'Product'} thumb ${index + 1}`}
                  title={COMPANY_INFO.name}
                  className="w-full h-full object-cover rounded-md"
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Image */}
      <div style={{ flex: 1, minWidth: 0, height: '100%', minHeight: '150px' }}>
        <Swiper
          style={{
            '--swiper-navigation-color': '#000',
            borderRadius: '8px',
            overflow: 'hidden',
            height: '100%',
          }}
          loop={false}
          spaceBetween={10}
          navigation={true}
          modules={[Navigation]}
          className="main-swiper mb-2"
          onSwiper={(swiper) => { mainSwiperRef.current = swiper; }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          key={`${uId}-main`}
        >
          {images.map((imageUrl, index) => (
            <SwiperSlide key={`${uId}-slide-${index}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={imageUrl.includes('/images/') ? '/images/' + imageUrl.split('/images/')[1] : imageUrl}
                alt={`${title || 'Product'} - view ${index + 1}`}
                title={COMPANY_INFO.name}
                className="h-full object-cover rounded-md shadow-sm"
                style={{ height: '100%' }}
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Horizontal Thumbs (Bottom side) */}
      {thumbs && thumbDirection === 'horizontal' && (
        <div className="thumbs-scroll overflow-x-auto overflow-y-hidden whitespace-nowrap py-2" style={{ scrollbarWidth: 'thin' }}>
          {images.map((imageUrl, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${uId}-thumb-button-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  mainSwiperRef.current?.slideTo(index);
                  setActiveIndex(index);
                }}
                className="inline-block p-0 border-0 bg-transparent cursor-pointer mr-2 shrink-0"
                style={{
                  width: '60px',
                  height: '60px',
                  opacity: isActive ? 1 : 0.4,
                  transform: isActive ? 'scale(1.04)' : 'scale(1)',
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                }}
              >
                <img
                  src={imageUrl.includes('/images/') ? '/images/' + imageUrl.split('/images/')[1] : imageUrl}
                  alt={`${title || 'Product'} thumb ${index + 1}`}
                  title={COMPANY_INFO.name}
                  className="w-full h-full object-cover rounded-md"
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
