import React from 'react';
import './ChooseUs.css';

const ChooseUs = () => {
  const features = [
    {
      icon: '🌿',
      title: 'Premium Quality',
      description: 'All our plants are carefully selected and nurtured to ensure they arrive healthy and ready to thrive in your space.'
    },
    {
      icon: '👨‍🌾',
      title: 'Expert Care',
      description: 'Professional guidance and personalized advice from our experienced horticulturists for optimal plant care.'
    },
    {
      icon: '↩️',
      title: 'Easy Returns',
      description: 'Simple and hassle-free return policy within 30 days if you\'re not completely satisfied with your purchase.'
    },
    {
      icon: '🔒',
      title: 'Safe & Secure',
      description: 'Your data and transactions are protected with industry-standard security measures and encryption.'
    }
  ];

  return (
    <section className="choose-us-section">
      <div className="choose-us-container">
        {/* Header */}
        <div className="header">
          <h2 className="header-title">Why Choose Us</h2>
          <p className="header-description">
            Discover what makes us the perfect partner for your green journey and plant care needs
          </p>
        </div>
        
        {/* Features List */}
        <div className="features-list">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              {/* Icon */}
              <div className="feature-icon-wrapper">
                <span className="feature-icon">{feature.icon}</span>
              </div>
              
              {/* Content */}
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChooseUs;