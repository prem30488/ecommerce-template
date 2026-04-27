import { useState, useRef, useEffect } from "react";
import { InstagramEmbed } from "react-social-media-embed";
import { getInstaReels } from "../util/APIUtils";
import "./instagramvideocaousel.css";

const InstagramVideoCarousel = () => {
  const [reels, setReels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await getInstaReels();
        if (res && res.length > 0) {
          setReels(res.filter(r => r.active));
        }
      } catch (err) {
        console.error("Failed to load Instagram reels", err);
      }
    };
    fetchReels();
  }, []);

  if (!reels || reels.length === 0) {
    return null; // or a skeleton loader
  }

  const goTo = (index) => {
    setActiveIndex(index);
  };

  const prev = () => {
    setActiveIndex((i) => (i === 0 ? reels.length - 1 : i - 1));
  };

  const next = () => {
    setActiveIndex((i) => (i === reels.length - 1 ? 0 : i + 1));
  };

  return (
    <section className="ivc-section">
      {/* Header */}
      <div className="ivc-header">
        <span className="ivc-subtitle">CONFIDENCE IN EVERY SIP</span>
        <h2 className="ivc-title">Real People, Real Progress</h2>
        <p className="ivc-desc">
          Watch our community in action — shop the products featured in each reel.
        </p>
      </div>

      {/* Carousel */}
      <div className="ivc-carousel-wrapper">
        {/* Prev Button */}
        <button className="ivc-nav ivc-nav--prev" onClick={prev} aria-label="Previous reel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Slides */}
        <div className="ivc-track" ref={trackRef}>
          {reels.map((reel, index) => {
            const offset = index - activeIndex;
            let slideClass = "ivc-slide";
            if (offset === 0) slideClass += " ivc-slide--active";
            else if (offset === -1 || (activeIndex === 0 && index === reels.length - 1))
              slideClass += " ivc-slide--prev";
            else if (offset === 1 || (activeIndex === reels.length - 1 && index === 0))
              slideClass += " ivc-slide--next";
            else slideClass += " ivc-slide--hidden";

            const isActive = index === activeIndex;

            return (
              <div
                key={index}
                className={slideClass}
                onClick={() => offset !== 0 && goTo(index)}
              >
                {/* Instagram Embed — only mount for the active slide to prevent
                    Instagram's embed.js from conflicting with React's VDOM */}
                <div className="ivc-embed-wrapper">
                  {isActive ? (
                    <InstagramEmbed key={`embed-${index}`} url={reel.url} width={328} />
                  ) : (
                    <div className="ivc-embed-placeholder">
                      <span>{reel.tag}</span>
                    </div>
                  )}
                </div>

                {/* Caption Card */}
                <div className="ivc-caption-card">
                  <span className="ivc-caption-tag">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    {reel.tag}
                  </span>
                  <p className="ivc-caption-text">{reel.caption}</p>
                  <a
                    href={reel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ivc-caption-link"
                  >
                    View on Instagram →
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Button */}
        <button className="ivc-nav ivc-nav--next" onClick={next} aria-label="Next reel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="ivc-dots">
        {reels.map((_, i) => (
          <button
            key={i}
            className={`ivc-dot${i === activeIndex ? " ivc-dot--active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to reel ${i + 1}`}
          />
        ))}
      </div>

      {/* Reel counter */}
      <p className="ivc-counter">
        <span>{activeIndex + 1}</span> / {reels.length}
      </p>
    </section>
  );
};

export default InstagramVideoCarousel;
