import React, { useState, useEffect } from 'react';
import './About.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobeAsia, faSeedling, faFlask } from '@fortawesome/free-solid-svg-icons';
import img1 from '../Assets/5.jpg';
import img2 from '../Assets/3.jpg';
import img3 from '../Assets/9.jpg';

const About = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    { image: img1, title: 'Modern Research Lab', description: 'Advanced testing and research facilities' },
    { image: img2, title: 'Smart Farming', description: 'Technology-driven cultivation methods' },
    { image: img3, title: 'Quality Assurance', description: 'Rigorous quality control processes' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleDotClick = (index) => {
    setActiveSlide(index);
  };

  return (
    <section className="about" id="about">
      <div className="about-content">
        <div className="about-text">
          <h2 className="section-title11">Our Legacy Of Excellence</h2>
          <div className="legacy-features">
            <div className="legacy-feature">
              <FontAwesomeIcon icon={faGlobeAsia} className="feature-icon" />
              <div className="feature-text">
                <h3>Extensive Network</h3>
                <p>Spanning over 1,000 acres of irrigated land with nationwide farm partnerships</p>
              </div>
            </div>
            <div className="legacy-feature">
              <FontAwesomeIcon icon={faSeedling} className="feature-icon" />
              <div className="feature-text">
                <h3>Advanced Cultivation</h3>
                <p>High-density plantations, polyhouses, and shade-net vertical farming</p>
              </div>
            </div>
            <div className="legacy-feature">
              <FontAwesomeIcon icon={faFlask} className="feature-icon" />
              <div className="feature-text">
                <h3>Research Excellence</h3>
                <p>State-of-the-art laboratories for soil and leaf diagnostics</p>
              </div>
            </div>
          </div>
        </div>
        <div className="about-slideshow">
          <div className="slide-wrapper">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`about-slide ${index === activeSlide ? 'active' : ''}`}
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="slide-content">
                  <h3>{slide.title}</h3>
                  <p>{slide.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="slide-controls">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`slide-dot ${index === activeSlide ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
                data-slide={index}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;