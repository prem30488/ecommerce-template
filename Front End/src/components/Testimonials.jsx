import React, { useState, useEffect } from "react";
import { API_BASE_URL } from '../constants/index.jsx';
import { resolveImageUrl } from '../util/imageUrl';
import './testimonials.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

import './styles.css';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { useId } from "react";


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from "@fortawesome/fontawesome-svg-core";
import { faQuoteLeft, faStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";

library.add(faStar);
library.add(faQuoteLeft);
library.add(faStarHalfAlt);



export const Testimonials = () => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const uId = useId();
  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/testimonial/getTestimonials?page=0&size=1000&sort=id,asc`);
        if (!res.ok) throw new Error("Oops! An error has occured");
        const json = await res.json();
        const activeTestimonials = (json.content || []).filter(t => !t.deleteFlag);
        setTestimonials(activeTestimonials);
      } catch (err) {
        console.log(err.message);
      }
    };
    getData();
  }, []);
  // Function to chunk the array into groups of size
  const chunkArray = (array, size) => {
    return array.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / size);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []; // start a new chunk
      }

      resultArray[chunkIndex].push(item);
      return resultArray;
    }, []);
  };

  // Divide data into chunks of three
  const chunks = chunkArray(testimonials, 3);

  return (
    <>



      <section className="testi-section">
        <div className="container mx-auto">
          <div className="testi-header">
            <span className="testi-eyebrow">Real Experiences</span>
            <h2 className="testi-title">Customer Voices</h2>
          </div>

          <Swiper
            style={{
              '--swiper-navigation-color': '#0d9488',
              '--swiper-pagination-color': '#0d9488',
              'height': '550px',
            }}
            loop={chunks.length > 1}
            spaceBetween={10}
            navigation={true}
            thumbs={{ swiper: thumbsSwiper }}
            modules={[FreeMode, Navigation, Thumbs]}
            className="mySwiper3"
            key={uId}
          >

            {chunks.map((testimonialsChunk, index) => (
              <SwiperSlide key={index}>
                <div className="row justify-content-center w-100 mx-0" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', padding: '0 1rem' }}>
                  {testimonialsChunk.map((testimonial) => (
                    <div className="col-12 col-md-6 col-lg-4 d-flex align-items-stretch" key={testimonial.id || testimonial.title}>
                      <div className="testi-card">
                        <div className="testi-avatar-wrap">
                          <img
                            src={resolveImageUrl(testimonial.imageURL)}
                            alt={testimonial.title}
                            className="testi-avatar"
                            onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=User'; }}
                          />
                        </div>

                        <h5 className="testi-name">{testimonial.title}</h5>

                        <p className="testi-role">
                          {testimonial.designation}
                          {testimonial.organization && (
                            <span className="testi-org">{testimonial.organization}</span>
                          )}
                        </p>

                        <ul className="testi-stars">
                          <li>
                            {testimonial.rating >= 1 ? <FontAwesomeIcon icon="star" /> : testimonial.rating >= 0.5 ? <FontAwesomeIcon icon="star-half-alt" /> : <FontAwesomeIcon icon="star" className="testi-star-empty" />}
                          </li>
                          <li>
                            {testimonial.rating >= 2 ? <FontAwesomeIcon icon="star" /> : testimonial.rating >= 1.5 ? <FontAwesomeIcon icon="star-half-alt" /> : <FontAwesomeIcon icon="star" className="testi-star-empty" />}
                          </li>
                          <li>
                            {testimonial.rating >= 3 ? <FontAwesomeIcon icon="star" /> : testimonial.rating >= 2.5 ? <FontAwesomeIcon icon="star-half-alt" /> : <FontAwesomeIcon icon="star" className="testi-star-empty" />}
                          </li>
                          <li>
                            {testimonial.rating >= 4 ? <FontAwesomeIcon icon="star" /> : testimonial.rating >= 3.5 ? <FontAwesomeIcon icon="star-half-alt" /> : <FontAwesomeIcon icon="star" className="testi-star-empty" />}
                          </li>
                          <li>
                            {testimonial.rating === 5 ? <FontAwesomeIcon icon="star" /> : testimonial.rating >= 4.5 ? <FontAwesomeIcon icon="star-half-alt" /> : <FontAwesomeIcon icon="star" className="testi-star-empty" />}
                          </li>
                        </ul>

                        <div className="testi-text-wrap">
                          <FontAwesomeIcon icon="quote-left" className="testi-quote-mark" />
                          <p className="testi-text">
                            "{testimonial.description}"
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </>
  );
}

export default Testimonials;
