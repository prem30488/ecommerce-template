import React, { useState, useEffect } from "react";
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
        const res = await fetch("//localhost:5000/api/testimonial/getTestimonials?page=0&size=1000&sort=id,asc");
        if (!res.ok) throw new Error("Oops! An error has occured");
        const json = await res.json();
        // Add static testimonials here
        const staticTestimonials = [
          {
            id: 'static-1',
            title: 'Prembhai',
            designation: 'Director',
            organization: 'Ecommerce Inc.',
            description: 'Excellent service and great support. Highly recommended!',
            rating: 1,
            imageURL: '/images/0/img.jpg',
          },
          {
            id: 'static-2',
            title: 'Rosie',
            designation: 'CEO',
            organization: 'Prem Micro Serv Pvt Ltd',
            description: 'The team delivered beyond expectations. Will work again!',
            rating: 2,
            imageURL: '/images/0/ayo-ogunseinde-6W4F62sN_yI-unsplash.jpg',
          },
          {
            id: 'static-3',
            title: 'Roose',
            designation: 'CA',
            organization: 'Hzneley Pvt Ltd',
            description: 'Professional and reliable service. Very satisfied.',
            rating: 3,
            imageURL: '/images/0/jimmy-fermin-bqe0J0b26RQ-unsplash.jpg',
          },
          {
            id: 'static-4',
            title: 'Foose',
            designation: 'IT Head',
            organization: 'Caamunda',
            description: 'Great experience from start to finish. Highly recommend!',
            rating: 4,
            imageURL: '/images/0/philip-martin-5aGUyCW_PJw-unsplash.jpg',
          },
          {
            id: 'static-5',
            title: 'Sarah Jenkins',
            designation: 'Marketing Lead',
            organization: 'Creative Spark',
            description: 'We saw immediate improvements in our workflow. Absolutely fantastic.',
            rating: 5,
            imageURL: 'https://placehold.co/100x100?text=SJ',
          },
          {
            id: 'static-6',
            title: 'Michael Chen',
            designation: 'Product Manager',
            organization: 'TechFlow',
            description: 'A seamless integration built by a stellar team. Highly knowledgeable.',
            rating: 4.5,
            imageURL: 'https://placehold.co/100x100?text=MC',
          },
          {
            id: 'static-7',
            title: 'Amanda Williams',
            designation: 'VP of Engineering',
            organization: 'Globex Corp',
            description: 'The attention to detail and professional communication was exactly what we needed.',
            rating: 5,
            imageURL: 'https://placehold.co/100x100?text=AW',
          },
          {
            id: 'static-8',
            title: 'Robert Fox',
            designation: 'Founder',
            organization: 'NextGen Solutions',
            description: 'Exceeded expectations. Very happy with the final product delivered on time.',
            rating: 4,
            imageURL: 'https://placehold.co/100x100?text=RF',
          },
          {
            id: 'static-9',
            title: 'Elena Rodriguez',
            designation: 'Operations Director',
            organization: 'Apex Dynamics',
            description: 'Streamlined our entire customer funnel. Support has been top notch!',
            rating: 5,
            imageURL: 'https://placehold.co/100x100?text=ER',
          },
          {
            id: 'static-10',
            title: 'David Kim',
            designation: 'CTO',
            organization: 'Pioneer Web',
            description: 'Robust architecture with great UI/UX sensibilities. Extremely polished work.',
            rating: 5,
            imageURL: 'https://placehold.co/100x100?text=DK',
          },
          {
            id: 'static-11',
            title: 'Laura Bennett',
            designation: 'E-commerce Manager',
            organization: 'Retail Pro',
            description: 'Sales went up exactly as promised! Best decision we made all year.',
            rating: 4.5,
            imageURL: 'https://placehold.co/100x100?text=LB',
          },
        ];
        setTestimonials([...json.content, ...staticTestimonials]);
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
            <span className="testi-eyebrow">HEAR FROM OUR CUSTOMERS</span>
            <h2 className="testi-title">Testimonials</h2>
          </div>

          <Swiper
            style={{
              '--swiper-navigation-color': '#0d9488',
              '--swiper-pagination-color': '#0d9488',
            }}
            loop={true}
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
                            src={testimonial.imageURL}
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
