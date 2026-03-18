import React from "react";
import BestSelling from "../../components/BestSelling";
import FeatureProducts from "../../components/FeatureProducts";
import HomeVideo from "../../components/HomeVideo";
import Slider from "../../components/Slider";
 import Testimonials from "../../components/Testimonials";
//import TestimonialsMDB from "../../components/TestimonialsMDB";
// import Gmap from "../../components/Gmap";
import NewOfferedProducts from "../../components/NewOfferedProducts"

export const Shop = () => {

  								
  return (
    <React.Fragment>
      <div style={{paddingTop:"100px"}}></div>              
    <div className="shop">
        <HomeVideo  />
      <div className="products">
          <BestSelling />
      </div>
      <Slider></Slider>
      <div className="products">
          <FeatureProducts  />
      </div>
    
      <Testimonials/>
      
      <NewOfferedProducts/>
    </div>
    
    </React.Fragment>
  );
};
