import { useState, useEffect } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import Slide from "./Slide";
import { getSliders } from "../util/APIUtils";
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
      <div className="thumbnail absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-[20] px-4 w-full justify-center">
        {data.map((item, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`relative flex-shrink-0 h-4 w-4 md:h-6 md:w-6 group rounded-full border transition-all duration-500 ${index === currentSlide ? 'border-sky-400 scale-125 bg-white/40' : 'border-white/20 opacity-40 hover:opacity-100 hover:border-white/50'}`}
            style={{ width: '100px', height: '100px' }}
          >
            <img
              src={item.src}
              alt=""
              className="w-full h-full object-cover rounded-full"
              style={{ width: '100px', height: '100px' }}
            />
            {index === currentSlide && <div className="absolute inset-0 bg-sky-400/10 rounded-full" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Slider;
