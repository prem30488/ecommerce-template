import React, { useState, useEffect } from "react";
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
import { getHomeSections } from "../../util/APIUtils";

const componentMap = {
    HomeVideo,
    FeatureBar,
    WelcomeSection,
    OurServices,
    InstagramVideoCarousel,
    SaleSlider,
    WeeklyHighlight,
    BestSellingCarousel,
    FeatureProductsCarousel,
    PromoSlider,
    Testimonials,
    OnlineSupport
};

export const Shop = () => {
    const [sections, setSections] = useState([]);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const data = await getHomeSections();
                // Filter only active sections and sort by order just in case
                const activeSections = data.filter(s => s.active).sort((a, b) => a.order - b.order);
                setSections(activeSections);
            } catch (error) {
                console.error('Error fetching home sections:', error);
                // Fallback to default order if API fails
                setSections([]);
            }
        };
        fetchSections();
    }, []);

    const renderSections = () => {
        if (sections.length === 0) {
            // Default fallback order if API fails or no sections found
            return (
                <>
                    <HomeVideo />
                    <FeatureBar />
                    <WelcomeSection />
                    <OurServices />
                    <InstagramVideoCarousel />
                    <SaleSlider />
                    <WeeklyHighlight />
                    <BestSellingCarousel />
                    <FeatureProductsCarousel />
                    <PromoSlider />
                    <Testimonials />
                    <OnlineSupport />
                </>
            );
        }

        return sections.map(section => {
            const Component = componentMap[section.componentName];
            return Component ? <Component key={section.id} /> : null;
        });
    };

    return (
        <React.Fragment>
            <SEO
                title={`Home | ${COMPANY_INFO.name} | Premium Supplements & Healthcare`}
                description={COMPANY_INFO.seoDescription}
                keywords={COMPANY_INFO.seoKeywords}
            />

            <div style={{ paddingTop: "30px" }}></div>
            <div className="shop">
                {renderSections()}
            </div>

        </React.Fragment>
    );
};
