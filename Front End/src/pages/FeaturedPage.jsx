import React, { useEffect } from "react";
import FeatureProducts from "../components/FeatureProducts";
import OnlineSupport from "../components/OnlineSupport";

const FeaturedPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", paddingTop: "80px" }}>
      {/* Hero Banner specific for Featured Products */}
      <div
        style={{
          background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
          color: "white",
          padding: "4rem 2rem",
          textAlign: "center"
        }}
      >
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", margin: "0 0 1rem 0", letterSpacing: "-0.02em" }}>
          Featured Collection
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#ccfbf1", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          Handpicked selections curated just for you. Explore our premium offerings and find something extraordinary.
        </p>
      </div>

      <div className="container mx-auto pb-20 px-4">
        {/* Render the FeatureProducts component */}
        <FeatureProducts />
        <img src="/images/certifications.png" alt="Certifications" className="certifications-banner" />
      </div>
      <OnlineSupport />
    </div>
  );
};

export default FeaturedPage;
