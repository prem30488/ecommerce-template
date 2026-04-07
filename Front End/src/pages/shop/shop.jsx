import React from "react";
import FeatureProductsCarousel from "../../components/FeatureProductsCarousel";
import HomeVideo from "../../components/HomeVideo";
import Slider from "../../components/Slider";
import SaleSlider from "../../components/SaleSlider";
import Testimonials from "../../components/Testimonials";
//import TestimonialsMDB from "../../components/TestimonialsMDB";
// import Gmap from "../../components/Gmap";
import NewOfferedProducts from "../../components/NewOfferedProducts"
import FeatureBar from "../../components/FeatureBar";
import InstagramVideoCarousel from "../../components/InstagramVideoCarousel";
import WeeklyHighlight from "../../components/WeeklyHighlight";
import BestSellingCarousel from "../../components/BestSellingCarousel";
import OnlineSupport from "../../components/OnlineSupport";
import PromoSlider from "../../components/PromoSlider";
export const Shop = () => {

    return (
        <React.Fragment>
            <div style={{ paddingTop: "100px" }}></div>
            <div className="shop">
                <HomeVideo />
                <FeatureBar />
                <InstagramVideoCarousel />
                <SaleSlider />
                <WeeklyHighlight />
                <BestSellingCarousel />
                <FeatureProductsCarousel />
                {/* <NewOfferedProducts /> */}
                <PromoSlider />
                <Testimonials />
                <OnlineSupport />
            </div>

        </React.Fragment>
    );
};
