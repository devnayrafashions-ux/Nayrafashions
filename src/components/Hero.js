import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const heroRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    setTimeout(() => hero.classList.add('loaded'), 100);
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-bg">
        <div className="hero-overlay" />
      </div>
      <div className="hero-content">
        <p className="hero-season">SPRING / SUMMER 2026</p>
        <h1 className="hero-title">
          <span>NEW</span>
          <span>COLLECTION</span>
        </h1>
        <div className="hero-divider" />
        <p className="hero-subtitle">
          Elegance redefined — discover pieces crafted for the modern woman
        </p>
        <div className="hero-buttons">
          <button className="btn-gold" onClick={() => navigate('/products')}>
            EXPLORE COLLECTION
          </button>
          <button className="btn-outline" onClick={() => navigate('/products')}>
            VIEW ALL
          </button>
        </div>
      </div>
      <div className="hero-scroll">
        <span>SCROLL</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
};

export default Hero;