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
        // Add placeholder products with real-looking data structure
        const placeholdersNeeded = 5 - allProducts.length;
        for (let i = 0; i < placeholdersNeeded; i++) {
            allProducts.push({
                id: `placeholder-${i}`,
                title: `Recommended Item`,
                img: `https://picsum.photos/seed/recommend-${i}/300/300`,
                productFlavors: [{ price: 999, flavor_id: 1 }]
            });
        }
    }

    return (
        <div className="frequent-carousel-container w-full" style={{ padding: '0 10px' }}>
            <Swiper
                style={{
                    '--swiper-navigation-color': '#0f172a',
                    '--swiper-navigation-size': '20px',
                }}
                loop={false}
                spaceBetween={20}
                slidesPerView={1}
                breakpoints={{
                    480: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                    1280: { slidesPerView: 5 }
                }}
                navigation={true}
                modules={[Navigation]}
                className="frequent-swiper"
                onSwiper={(swiper) => { swiperRef.current = swiper; }}
                key={`${uId}-frequent`}
            >
                {allProducts.map((product, index) => {
                    const firstFlavor = product.productFlavors?.[0];
                    const price = firstFlavor?.price || 0;
                    
                    return (
                        <SwiperSlide key={`${uId}-frequent-${product.id || index}`}>
                            <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:border-sky-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full">
                                <div className="aspect-[4/3] overflow-hidden bg-slate-50 relative">
                                    <img
                                        src={product.img}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                        <span className="text-sky-500 font-bold text-xs">+</span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">
                                        {product.brand || 'Premium'}
                                    </div>
                                    <h6 className="text-[11px] font-bold text-slate-800 line-clamp-1 mb-2 group-hover:text-sky-600 transition-colors">
                                        {product.title}
                                    </h6>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xs font-black text-slate-900">
                                            ₹{price.toLocaleString()}
                                        </span>
                                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">
                                            In Stock
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default FrequentlyBoughtCarousel;