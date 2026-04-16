import React, { useContext, useId } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { ShopContext } from "../context/shop-context";
import SimilarProduct from "./SimilarProduct";
import "../pages/productDetails/frequently-bought.css";

const SimilarProducts = ({ productCat }) => {
  const { products } = useContext(ShopContext);
  const uId = useId();

  if (!productCat || !products) return null;

  // Robust Category Resolution
  const getProductCategory = (p) => {
    return p.categoryid || p.category_id || p.categories?.[0]?.id || p.Category?.id || p.category || p.Category?.title || p.categories?.[0]?.title;
  };

  const currentCategory = getProductCategory(productCat);
  
  const similarProducts = products.filter(p => {
    // 1. Don't show the current product itself
    if (String(p.id) === String(productCat.id)) return false;
    
    // 2. Resolve this product's category identifier/title
    const pCategory = getProductCategory(p);
    
    // 3. Match by ID or Title
    // If we have an ID, match by that. If we have a title/string, match by that.
    return pCategory && currentCategory && pCategory === currentCategory;
  });

  if (similarProducts.length === 0) return null;

  return (
    <div className="ppp-below" style={{ marginTop: '60px', paddingBottom: '40px' }}>
      <h2 className="ppp-section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>
        Discover Similar Treasures
      </h2>

      <div className="frequent-carousel-container w-full mx-auto" style={{ maxWidth: '1400px' }}>
        <Swiper
          style={{
            '--swiper-navigation-color': '#0f172a',
            '--swiper-navigation-size': '12px'
          }}
          spaceBetween={16}
          slidesPerView={1.2}
          breakpoints={{
            480: { slidesPerView: 2.2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 }
          }}
          navigation={true}
          modules={[Navigation]}
          className="frequent-swiper"
          key={`${uId}-similar`}
        >
          {similarProducts.map((p) => (
            <SwiperSlide key={p.id}>
              <SimilarProduct product={p} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default SimilarProducts;
