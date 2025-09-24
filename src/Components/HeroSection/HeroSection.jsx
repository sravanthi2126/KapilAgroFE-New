import React from 'react';
import './HeroSection.css';
import backgroundImage from '../Assets/17.jpg'; // Correct path

const HeroSection = () => {
  return (
    <div 
      className="hero-section" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <h1>
        <span>Cultivating</span>
        <span className="highlight">Green Excellence</span>
      </h1>
      <p>
        Premium Quality Plants, Fertilizers & Expert Gardening Solutions 
        for Your Green Paradise
      </p>
      <div className="buttons">
        <button className="explore-btn">🌱 Explore Collection</button>
        <button className="contact-btn">📞 Contact Expert</button>
      </div>
    </div>
  );
};

export default HeroSection;
