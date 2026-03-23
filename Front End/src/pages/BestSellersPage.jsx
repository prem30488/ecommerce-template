import React, { useEffect } from "react";
import BestSelling from "../components/BestSelling";

const BestSellersPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", paddingTop: "80px" }}>
      {/* Hero Banner specific for Best Sellers */}
      <div 
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "white",
          padding: "4rem 2rem",
          textAlign: "center",
          marginBottom: "2rem"
        }}
      >
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", margin: "0 0 1rem 0", letterSpacing: "-0.02em" }}>
          Our Best Sellers
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#cbd5e1", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          Discover the top-rated, most-loved products chosen by our community. Upgrade your routine with these proven favorites.
        </p>
      </div>

      <div className="container mx-auto pb-20 px-4">
        {/* Render the BestSelling component (which includes the new carousel and grid) */}
        <BestSelling />
      </div>
    </div>
  );
};

export default BestSellersPage;
