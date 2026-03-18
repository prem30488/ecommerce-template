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

        setTestimonials(json.content);
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



      <div className="row d-flex justify-content-center">
        <div className="col-md-10 col-xl-8 text-center">
          <h1 className="mb-4">Testimonials</h1>
          <p className="mb-4 pb-2 mb-md-5 pb-md-0">
            What our clients say about us
          </p>
        </div>
      </div>
      <section style={{ color: "#000", backgroundColor: "#f3f2f2" }}>
        <div className="container py-5">
          <Swiper
            style={{
              '--swiper-navigation-color': '#000',
              '--swiper-pagination-color': '#000',
            }}
            loop={true}
            spaceBetween={10}
            navigation={true}
            thumbs={{ swiper: thumbsSwiper }}
            modules={[FreeMode, Navigation, Thumbs]}
            className="mySwiper3"
            key={uId}
          >

            {chunks.map((testimonials, index) => (

              <SwiperSlide>
                <div key={index} className="row text-center" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {testimonials.map((testimonial) => (
                    <div className="col-md-4 mb-4 mb-md-0">
                      <div className="card">
                        <div className="card-body py-4 mt-2">
                          <div className="d-flex justify-content-center mb-4">
                            <img src={testimonial.imageURL} alt={testimonial.title}
                              className="rounded-circle shadow-1-strong" width="100" height="100" />
                          </div>
                          <h5 className="font-weight-bold">{testimonial.title}</h5>
                          <h6 className="font-weight-bold my-3">{testimonial.designation} , {testimonial.organization}</h6>
                          <ul className="list-unstyled d-flex justify-content-center">
                            <li>
                              {testimonial.rating >= 1 ? <FontAwesomeIcon icon="star" /> : <FontAwesomeIcon icon="star-half-alt" />}
                            </li>
                            <li>
                              {testimonial.rating >= 2 ? <FontAwesomeIcon icon="star" /> : <FontAwesomeIcon icon="star-half-alt" />}

                            </li>
                            <li>
                              {testimonial.rating >= 3 ? <FontAwesomeIcon icon="star" /> : <FontAwesomeIcon icon="star-half-alt" />}
                            </li>
                            <li>
                              {testimonial.rating >= 4 ? <FontAwesomeIcon icon="star" /> : testimonial.rating >= 3.5 ? <FontAwesomeIcon icon="star-half-alt" /> : ""}
                            </li>
                            <li>
                              {testimonial.rating === 5 ? <FontAwesomeIcon icon="star" /> : testimonial.rating === 4.5 ? <FontAwesomeIcon icon="star-half-alt" /> : ""}

                            </li>
                          </ul>
                          <p className="mb-2">
                            <FontAwesomeIcon icon="quote-left" />
                            {testimonial.description}
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
