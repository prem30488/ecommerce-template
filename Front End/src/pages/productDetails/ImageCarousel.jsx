import React, { useState } from 'react';
// Import Swiper styles
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

import './styles.css';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { useId } from 'react'
const ImageCarousel = ({ id, title, className, thumbs, imageList }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const uId = useId();
  // Split the comma-separated string into an array of image URLs
  if(imageList === undefined)
  {
    
    return (
        <div>
          No Images to display...
            {/* LIST:{JSON.stringify(imageList)}. */}
        </div>
    );
  } 
  const images = imageList?imageList.split(','):[];
  const thumbsSwiperParams = {
    spaceBetween: 10,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesVisibility: true,
    watchSlidesProgress: true,
  };
  
  return (
    <>
    <Swiper
        style={{
          '--swiper-navigation-color': '#fff',
          '--swiper-pagination-color': '#fff',
        }}
        loop={false}
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper2"
        key={uId}
      >

{images.map((imageUrl, index) => (
  index<5 && index< images.length ?
  images.length===1 ?<><SwiperSlide> 
  <img src={imageUrl}/>
</SwiperSlide><SwiperSlide>
          <img src={imageUrl} />
        </SwiperSlide></> :<>
        <SwiperSlide>
          <img src={imageUrl} />
        </SwiperSlide>
        </>
        :""
))}         
      </Swiper>
      <br/>
      {/* <Swiper {...thumbsSwiperParams}>
      {images.map((image, index) => (
        <SwiperSlide key={index}>
          <img src={image} alt={`Thumbnail ${index}`} />
        </SwiperSlide>
      ))}
    </Swiper> */}
    </>
  );
};

export default ImageCarousel;
