import React, { useState, useRef } from 'react';
// Import Swiper styles
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';

import './styles.css';
import { Navigation } from 'swiper/modules';
import { useId } from 'react'

const ImageCarousel = ({ id, title, mainImage, additionalImages, imageList, thumbs = true }) => {
  const uId = useId();
  const mainSwiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  let images = [];
  if (imageList) {
    images = typeof imageList === 'string' ? imageList.split(',').map(s => s.trim()).filter(Boolean) : imageList;
  } else {
    images = [
      mainImage,
      ...(additionalImages?.map(img => img.url) || [])
    ].filter(Boolean);
  }

  // Ensure at least 10 unique images per product
  if (images.length < 10) {
    const fillCount = 10 - images.length;
    for (let i = 0; i < fillCount; i++) {
      images.push(`https://picsum.photos/seed/${encodeURIComponent(id)}-${i}/900/600`);
    }
  }

  // Deduplicate in case there are duplicates (not required, but safer)
  images = Array.from(new Set(images));

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center p-10 bg-gray-200 rounded-lg text-gray-500">
        No images available
      </div>
    );
  }

  return (
    <div className="product-carousel-container" style={{ minHeight: '100%' }}>
      <Swiper
        style={{
          '--swiper-navigation-color': '#000',
          borderRadius: '8px',
          overflow: 'hidden'
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
          <SwiperSlide key={`${uId}-slide-${index}`}>
            <img
              src={imageUrl}
              alt={`${title || 'Product'} - view ${index + 1}`}
              className="w-full h-auto object-cover rounded-md shadow-sm"
              loading="lazy"
              onError={(e) => {
                console.error(`Failed to load image: ${imageUrl}`);
                e.target.style.display = 'none';
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {thumbs && (
        <div className="thumbs-scroll overflow-x-auto overflow-y-hidden whitespace-nowrap py-2" style={{ scrollbarWidth: 'thin' }}>
          {images.map((imageUrl, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${uId}-thumb-button-${index}`}
                onClick={() => {
                  mainSwiperRef.current?.slideTo(index);
                  setActiveIndex(index);
                }}
                className="inline-block p-0 border-0 bg-transparent cursor-pointer mr-2"
                style={{
                  width: 100,
                  height: 100,
                  opacity: isActive ? 1 : 0.4,
                  transform: isActive ? 'scale(1.04)' : 'scale(1)',
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                }}
              >
                <img
                  src={imageUrl}
                  alt={`${title || 'Product'} thumb ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                  loading="lazy"
                  onError={(e) => {
                    console.error(`Failed to load thumb: ${imageUrl}`);
                    e.target.style.display = 'none';
                  }}
                  style={{ display: 'block', width: '100%', height: '100%' }}
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
