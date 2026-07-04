import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

// Place these three files in your public/images folder (or swap for your
// Django media URLs, e.g. `${process.env.REACT_APP_API_URL}/media/hero/...`)
const HERO_IMAGES = [
  '/images/hero-jewelry.png',
  '/images/hero-hair-accessory.png',
  '/images/hero-blouse.jpeg',
];

const SLIDE_DURATION = 5000; // ms each image stays on screen

const Hero = () => {
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    setTimeout(() => hero.classList.add('loaded'), 100);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-bg">
        {HERO_IMAGES.map((src, i) => (
          <div
            key={src}
            className={`hero-bg-slide ${i === activeIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
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