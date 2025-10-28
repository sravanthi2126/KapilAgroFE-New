import React from 'react';
import './HeroSection.css';
import backgroundImage from '../Assets/17.jpg';

const HeroSection = ({ setCurrentPage }) => {

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = 80;
      const y = section.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      return true;
    }
    return false;
  };

  const handleExploreClick = () => {
    setCurrentPage('categories');
    // Scroll to categories section on the same page
    scrollToSection('fresh-landing'); // Or whatever section contains your categories
  };

  const handleContactClick = () => {
    setCurrentPage('contact');
    // Scroll to contact/footer section on the same page
    scrollToSection('footer');
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