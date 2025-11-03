import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';
import backgroundImage from '../Assets/17.jpg';

const HeroSection = ({ setCurrentPage }) => {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    setCurrentPage('categories');
    navigate('/categories');
  };

  const handleContactClick = () => {
    setCurrentPage('contact');
    // If you want contact to also navigate to route instead of scrolling
    navigate('/');
    setTimeout(() => {
      const section = document.getElementById('footer');
      if (section) {
        const offset = 80;
        const y = section.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 300);
  };

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
        <button className="explore-btn" onClick={handleExploreClick}>
          🌱 Explore Collection
        </button>
        <button className="contact-btn" onClick={handleContactClick}>
          📞 Contact Expert
        </button>
      </div>
    </div>
  );
};

export default HeroSection;