import { useState, useEffect } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import Slide from "./Slide";
import { getSliders } from "../util/APIUtils";
import Alert from 'react-s-alert';
import "../pages/product.css";

const Slider = () => {
  const [data, setData] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0); // Start at 0 for indexed arrays
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSliders(0, 10, true)
      .then(res => {
        setData(res.content);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching sliders:", error);
        setLoading(false);
        // Fallback or silent fail for home page slider
      });
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? data.length - 1 : prev - 1));
  };
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === data.length - 1 ? 0 : prev + 1));
  };

  if (loading) return <div className="h-[50vh] flex items-center justify-center">Loading Slider...</div>;
  if (data.length === 0) return null;

  return (
    <div className="frame relative overflow-x-hidden h-[50vh] md:h-[70vh] lg:h-[80vh] w-full">
      <div
        className="slider flex transition-transform duration-1000 ease-in-out h-full"
        style={{ transform: `translateX(-${(100 / data.length) * currentSlide}%)`, width: `${100 * data.length}%` }}
      >
        {data.map((item) => (
          <div key={item.id} style={{ width: `${100 / data.length}%` }} className="h-full">
            <Slide image={item} />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="btns">
        <button
          onClick={prevSlide}
          className="pointer-events-auto bg-white/10 hover:bg-white/30 text-black p-3 md:p-4 rounded-full border border-white/20 backdrop-blur-sm transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg"
        >
          <BsArrowLeft size={28} />
        </button>

        <button
          onClick={nextSlide}
          className="pointer-events-auto bg-white/10 hover:bg-white/30 text-black p-3 md:p-4 rounded-full border border-white/20 backdrop-blur-sm transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg"
        >
          <BsArrowRight size={28} />
        </button>
      </div>

      {/* Progress indicators at bottom */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-[10]">
        {data.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ${index === currentSlide ? 'bg-white w-8 md:w-12' : 'bg-white/30 w-3 md:w-4 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;
