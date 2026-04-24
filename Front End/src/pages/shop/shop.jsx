import React from "react";
import FeatureProductsCarousel from "../../components/FeatureProductsCarousel";
import HomeVideo from "../../components/HomeVideo";
import WelcomeSection from "../../components/WelcomeSection";
import OurServices from "../../components/OurServices";
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
import SEO from "../../components/SEO";
import { COMPANY_INFO } from "../../constants/companyInfo";

export const Shop = () => {

    return (
        <React.Fragment>
            <SEO
                title={`Home | ${COMPANY_INFO.name} | Premium Supplements & Healthcare`}
                description={COMPANY_INFO.seoDescription}
                keywords={COMPANY_INFO.seoKeywords}
            />

            <div style={{ paddingTop: "30px" }}></div>
            <div className="shop">
                <HomeVideo />
                <FeatureBar />
                <WelcomeSection />
                <OurServices />
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
