
import React, { useEffect, useRef, useState } from 'react';
import './Hero.css';

// Desktop: existing landscape images

const DESKTOP_IMAGES = [
  '/images/hero-jewelry.jpeg',
  '/images/hero-hair-accessory.jpeg',
  '/images/hero-blouse.jpeg',
];


const MOBILE_IMAGES = [
  '/images/mobile-portrait-1.jpeg',
  '/images/mobile-portrait-2.jpeg',
  '/images/mobile-portrait-3.jpeg',
];





const SLIDE_DURATION = 5000;

const Hero = () => {
  const heroRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia('(max-width: 768px)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const handleScreenChange = (event) => {
      setIsMobile(event.matches);
      setActiveIndex(0);
    };

    mediaQuery.addEventListener('change', handleScreenChange);

    return () => {
      mediaQuery.removeEventListener('change', handleScreenChange);
    };
  }, []);

  const images = isMobile ? MOBILE_IMAGES : DESKTOP_IMAGES;

  useEffect(() => {
    const hero = heroRef.current;

    if (!hero) return;

    const timeout = setTimeout(() => {
      hero.classList.add('loaded');
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    setActiveIndex(0);

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [isMobile, images.length]);

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-bg">
        {images.map((src, index) => (
          <div
            key={src}
            className={`hero-bg-slide ${
              index === activeIndex ? 'active' : ''
            }`}
            style={{ backgroundImage: `url("${src}")` }}
          />
        ))}

        <div className="hero-overlay" />
      </div>

      <div className="hero-content">
        <div className="hero-divider" />
      </div>

      <div className="hero-scroll">
        <span>SCROLL</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
};

export default Hero;
