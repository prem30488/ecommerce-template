import React, { useEffect, useState } from "react";
import { resolveImageUrl } from "../util/imageUrl";
import styles from "./About.module.css";
import { 
  Person, 
  Atom, 
  Leaf, 
  TrendUp, 
  Users, 
  ShieldCheck, 
  Flask, 
  Trophy, 
  Briefcase,
  Monitor,
  Heart
} from "phosphor-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const About = () => {
  const [counts, setCounts] = useState({ happy: 0, products: 0, cities: 0, years: 0 });
  const [team, setTeam] = useState([]);

  useEffect(() => {
    // Fetch leadership team from DB
    import("../util/APIUtils").then(({ getLeadershipTeams }) => {
      getLeadershipTeams(0, 50).then(res => {
        setTeam(res.content);
      });
    });

    // Simple counter animation

    const interval = setInterval(() => {
      setCounts(prev => ({
        happy: prev.happy < 15000 ? prev.happy + 150 : 15000,
        products: prev.products < 45 ? prev.products + 1 : 45,
        cities: prev.cities < 210 ? prev.cities + 5 : 210,
        years: prev.years < 12 ? prev.years + 1 : 12
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.aboutPageContainer} style={{ paddingTop: "120px" }}>
      
      {/* 🚀 Hero Section - Enhanced */}
      <section className={styles.hero}>
        <div className={styles.animateFadeIn}>
          <span className={styles.heroSub}>Pioneering Natural Wellness</span>
          <h1 className={styles.heroTitle}>Nourishing You, <br /> <span style={{ color: "var(--accent)" }}>Naturally.</span></h1>
          <p className={styles.heroDesc}>
            At Hanley Healthcare, we don't just create supplements; we craft scientifically-backed botanical formulas that empower you to reclaim your vitality and live every moment to its fullest.
          </p>
        </div>

        <div className={styles.heroImageWrapper} style={{ maxWidth: '1200px', margin: '0 auto', borderRadius: '32px', overflow: 'hidden' }}>
          <img 
            src="/images/about/about_1.jpg" 
            alt="Nature Hero" 
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </section>

      {/* 📊 Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{counts.happy.toLocaleString()}+</span>
          <span className={styles.statLabel}>Happy Lives Impacted</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{counts.products}+</span>
          <span className={styles.statLabel}>Organic Formulas</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{counts.cities}+</span>
          <span className={styles.statLabel}>Cities Delivery</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{counts.years}</span>
          <span className={styles.statLabel}>Years of Research</span>
        </div>
      </section>

      {/* ✨ Core Values - Modern Cards */}
      <section style={{ padding: '80px 0' }}>
        <div className={styles.sectionTitleBlock}>
          <h2 className={styles.sectionTitle}>The Hanley Standard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Precision in science. Purity in nature. Power in results.</p>
        </div>
        
        <div className={styles.gridContent}>
          <div className={styles.glassCard}>
            <div className={styles.iconWrapper}><Trophy size={32} weight="duotone" /></div>
            <h3>Peak Vitality</h3>
            <p>Formulated for maximum bioavailability, ensuring your body absorbs every gram of pure nutritional excellence.</p>
          </div>
          <div className={styles.glassCard}>
            <div className={styles.iconWrapper}><ShieldCheck size={32} weight="duotone" /></div>
            <h3>Purity Guaranteed</h3>
            <p>Every batch undergoes double-blind lab testing to ensure zero heavy metals, zero toxins, and 100% potency.</p>
          </div>
          <div className={styles.glassCard}>
            <div className={styles.iconWrapper}><TrendUp size={32} weight="duotone" /></div>
            <h3>Sustainable Growth</h3>
            <p>Ethically sourced ingredients that support local farmers while preserving the planet's botanical diversity.</p>
          </div>
        </div>
      </section>

      {/* 🎡 Interactive Carousel Section */}
      <section className={styles.carouselSection}>
        <div className={styles.sectionTitleBlock} style={{ color: 'white' }}>
          <h2 className={styles.sectionTitle} style={{ color: 'white' }}>Our World-Class Operations</h2>
          <p style={{ opacity: 0.7 }}>From seed testing to robotic packaging, transparency is our foundation.</p>
        </div>
        
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          coverflowEffect={{ rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: true }}
          pagination={true}
          modules={[EffectCoverflow, Pagination, Autoplay]}
          className="mySwiper"
        >
          <SwiperSlide className={styles.swiperSlide} style={{ background: '#000' }}>
            <img src="/images/about/8_becab0f3-82f7-4acc-92f2-e2abea04b6c9.jpg" alt="Lab" className={styles.slideImage} />
            <div style={{ position: 'absolute', bottom: 40, left: 40, color: 'white' }}>
              <h4 style={{ fontSize: '24px', fontWeight: 700 }}>Botanical Sourcing</h4>
            </div>
          </SwiperSlide>
          <SwiperSlide className={styles.swiperSlide}>
            <img src="/images/about/9_0edfe37c-6d05-4698-ba7f-1d90d0c93670.jpg" alt="Science" className={styles.slideImage} />
            <div style={{ position: 'absolute', bottom: 40, left: 40, color: 'white' }}>
              <h4 style={{ fontSize: '24px', fontWeight: 700 }}>Molecular Formulation</h4>
            </div>
          </SwiperSlide>
          <SwiperSlide className={styles.swiperSlide}>
            <img src="/images/about/about_img_4.jpg" alt="Packaging" className={styles.slideImage} />
            <div style={{ position: 'absolute', bottom: 40, left: 40, color: 'white' }}>
              <h4 style={{ fontSize: '24px', fontWeight: 700 }}>Eco-Packaging</h4>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* 🧩 Unique Edge - Alternating Layout */}
      <div className={styles.splitLayout}>
        <div className={styles.imageReveal}>
          <img src="/images/about/6_35eeab6d-142d-445d-aa82-e79cbe43a217.jpg" alt="Gut Health Illustration" />
        </div>
        <div className={styles.textContent}>
          <h2>Why We're Different</h2>
          <p style={{ color: 'var(--text-muted)' }}>Most companies follow trends. We follow biology. Our "Active Bio-Sync" technology ensures supplements work with your body's natural rhythm.</p>
          
          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <Atom size={24} color="var(--accent)" weight="fill" />
              <div>
                <h4>Zero Artificial Additives</h4>
                <p>No fillers, no dyes, no compromises. Ever.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <Flask size={24} color="var(--accent)" weight="fill" />
              <div>
                <h4>Clinical Grade Potency</h4>
                <p>Concentrations designed to show visible results in 30 days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.splitLayout} style={{ background: '#f8fafc', padding: '100px 40px', borderRadius: '40px' }}>
        <div className={styles.textContent} style={{ order: 2 }}>
          <h2>The Purity Promise</h2>
          <p style={{ color: 'var(--text-muted)' }}>From the mineral-rich soils of our source farms to the final encapsulation in our ISO-9001 facility, every step is rigorously documented.</p>
          <p style={{ marginTop: '20px' }}>We invite you to scan the QR code on any of our products to see the direct lab results and origin story of that specific bottle.</p>
        </div>
        <div className={styles.imageReveal} style={{ order: 1 }}>
          <img src="/images/about/5_d90706a2-adba-417c-a6a6-a2463dd7b22e.jpg" alt="Sourcing Table" />
        </div>
      </div>

      {/* 📅 Timeline / History */}
      <section className={styles.timelineSection}>
        <div className={styles.sectionTitleBlock}>
          <h2 className={styles.sectionTitle}>Our Evolution</h2>
        </div>
        
        <div className={styles.timelineContainer}>
          <div className={styles.timelineLine}></div>
          
          <div className={styles.timelineNode}>
            <div className={styles.timelineContent}>
              <span className={styles.timelineYear}>2012</span>
              <h4>The Foundation</h4>
              <p>Dr. Hanley starts the first research lab focused on molecular botanical syncing.</p>
            </div>
          </div>

          <div className={styles.timelineNode} style={{ justifyContent: 'flex-end' }}>
            <div className={styles.timelineContent}>
              <span className={styles.timelineYear}>2018</span>
              <h4>Global Sourcing</h4>
              <p>Expansion to 15 countries to source ingredients in their most potent natural habitats.</p>
            </div>
          </div>

          <div className={styles.timelineNode}>
            <div className={styles.timelineContent}>
              <span className={styles.timelineYear}>2024</span>
              <h4>Direct-to-You</h4>
              <p>Launching the digital wellness platform to provide personalized healthcare worldwide.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 👥 Leadership Team Section */}
      {team && team.length > 0 && (
        <section className={styles.leadershipSection}>
          <div className={styles.sectionTitleBlock}>
            <h2 className={styles.sectionTitle}>The Visionary Team</h2>
            <p style={{ color: 'var(--text-muted)' }}>Meet the minds behind Hanley's healthcare revolution.</p>
          </div>
          
          <div className={styles.leadershipGrid}>
            {team.map((member) => (
              <div key={member.id} className={styles.leaderCard}>
                <img src={resolveImageUrl(member.image)} alt={member.name} className={styles.leaderImage} />
                <h3 className={styles.leaderName}>{member.name}</h3>
                <span className={styles.leaderDesignation}>{member.designation}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 🤝 Final CTA */}
      <section style={{ textAlign: 'center', padding: '120px 20px', background: 'var(--primary)', color: 'white' }}>
        <h2 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '20px' }}>Join the Wellness Revolution</h2>
        <p style={{ opacity: 0.7, maxWidth: '600px', margin: '0 auto 40px' }}>
          Subscribe to our journey and get exclusive access to research insights and botanical breakthroughs.
        </p>
        <button style={{ 
          background: 'var(--accent)', 
          color: 'white', 
          padding: '18px 45px', 
          borderRadius: '50px', 
          fontWeight: 700,
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          transition: 'transform 0.3s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Explore Our Story
        </button>
      </section>
      
    </div>
  );
};

export default About;
