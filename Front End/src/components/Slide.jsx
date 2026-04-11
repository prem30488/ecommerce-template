import { Link } from "react-router-dom";
import { resolveImageUrl } from "../util/imageUrl";

const Slide = ({ image }) => {
  return (
    <div
      className="slide h-full flex justify-center items-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${resolveImageUrl(image.src)})` }}
      key={image.id}
    >
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-[0]" />
      
      <div className="slide-content relative flex flex-col gap-4 md:gap-8 items-start px-6 md:px-12 lg:px-24 container mx-auto z-[1]">
        <h1 className="text-3xl md:text-5xl lg:text-7xl text-white font-bold w-full md:w-3/4 lg:w-2/3 leading-tight tracking-tight drop-shadow-lg transform transition-all duration-700 translate-y-0 opacity-100">
          {image.headline}
        </h1>
        <p className="text-white/90 text-sm md:text-lg lg:text-xl w-full md:w-2/3 lg:w-1/2 line-clamp-3 md:line-clamp-none leading-relaxed drop-shadow-md">
          {image.body}
        </p>
        <div className="flex gap-4 mt-2 md:mt-6">
          <Link
            to={`/byCategory/${image.category}`}
            className="group relative overflow-hidden inline-flex items-center justify-center px-8 py-3 md:px-10 md:py-4 font-bold text-white transition-all duration-300 bg-transparent border-2 border-white hover:text-black rounded-full"
          >
            <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-full bg-white group-hover:translate-x-0"></span>
            <span className="relative">{image.cta || 'Shop Now'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Slide;
