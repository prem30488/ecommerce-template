import "./HomeVideo.css";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const HomeVideo = () => {
  return (
    <div className="hVideo">
      <main id="pages-home-home-content" className="thorne-homepage">
        <section className="hero is-marginless" id="pages">
          <video autoPlay="autoPlay" muted="muted" playsInline="" loop="loop" id="healthy-aging-banner">
            <source src="movie.mp4" type="video/mp4"></source>
          </video> <div className="container has-text-centered">
            <div className="brand-intro">
              <div className="wade-sub-title">BUILD&nbsp; TO&nbsp; LAST</div>
              <div className="wade-title is-1">Small steps, big
                <span className="miller">strides</span></div>
              <div className="columns is-marginless is-buttons"><div className="column">
                <a href="/productMen" className="button shop-wade">
                  Shop the Collection</a></div></div></div></div>
          <br /><br /><br />
        </section>
      </main>
    </div>
  );
};

export default HomeVideo;
