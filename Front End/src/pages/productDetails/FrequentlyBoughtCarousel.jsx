import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { useId } from 'react';

const FrequentlyBoughtCarousel = ({ currentProduct, frequentProducts }) => {
    const uId = useId();
    const swiperRef = useRef(null);

    // Combine current product with frequently bought items
    const allProducts = [currentProduct, ...frequentProducts];

    // Ensure at least 5 products for the carousel
    if (allProducts.length < 5) {
        // Add placeholder products if needed
        const placeholdersNeeded = 5 - allProducts.length;
        for (let i = 0; i < placeholdersNeeded; i++) {
            allProducts.push({
                id: `placeholder-${i}`,
                title: `Recommended Product ${i + 1}`,
                img: `https://picsum.photos/seed/recommend-${i}/300/300`,
                price: Math.floor(Math.random() * 100) + 50
            });
        }
    }

    return (
        <div className="frequent-carousel-container w-full">
            <Swiper
                style={{
                    '--swiper-navigation-color': '#000',
                }}
                loop={false}
                spaceBetween={16}
                slidesPerView={1}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                    1280: { slidesPerView: 5 }
                }}
                navigation={true}
                modules={[Navigation]}
                className="frequent-swiper mb-2"
                onSwiper={(swiper) => { swiperRef.current = swiper; }}
                key={`${uId}-frequent`}
            >
                {allProducts.map((product, index) => (
                    <SwiperSlide key={`${uId}-frequent-${product.id || index}`}>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-square overflow-hidden">
                                <img
                                    src={product.img}
                                    alt={product.title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                    onError={(e) => {
                                        console.error(`Failed to load image: ${product.img}`);
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                            <div className="p-1">
                                <h6 className="text-sm font-small text-gray-900 line-clamp-2 mb-1">
                                    {product.title}
                                </h6>
                                <p className="text-lg font-bold text-sky-600">
                                    ${product.price}
                                </p>

                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default FrequentlyBoughtCarousel;