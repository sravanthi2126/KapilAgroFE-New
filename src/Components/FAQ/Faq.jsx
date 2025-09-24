import { useState } from 'react';
import './Faq.css';

const FAQ = () => {
  const [activeItem, setActiveItem] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "What types of products do you sell?",
      answer: "We offer a comprehensive range of horticultural, ornamental, and medicinal plants, including premium fruit trees, organic vegetable seedlings, vibrant flowering plants, rare exotic species, therapeutic herbs, and eco-friendly bio-fertilizers to nurture your green dreams."
    },
    {
      id: 2,
      question: "Are your plants suitable for all climates?",
      answer: "Absolutely! We specialize in providing climate-specific plants with detailed care guides and expert recommendations to help you choose the perfect varieties that will thrive in your local environment and weather conditions."
    },
    {
      id: 3,
      question: "Do you offer bulk discounts for large orders?",
      answer: "Yes, we provide attractive bulk pricing and wholesale rates for nurseries, landscapers, farmers, and commercial buyers. Contact us for custom quotes on large orders and enjoy significant savings on your green investments."
    },
    {
      id: 4,
      question: "Do you provide consultation services for plant care?",
      answer: "We offer complimentary basic guidance through WhatsApp and email support. For advanced consultation on large-scale gardening, landscaping projects, and commercial farming, our expert horticulturists provide professional consultation services."
    },
    {
      id: 5,
      question: "What is your return and exchange policy?",
      answer: "We stand behind our quality with a comprehensive return policy for damaged or incorrect products. Live plants are eligible for return only if they arrive in poor condition or don't match your order specifications."
    },
    {
      id: 6,
      question: "How can I reach your customer support team?",
      answer: (
        <div className="contact-info">
          <p>Connect with our friendly support team through multiple channels:</p>
          <ul>
            <li>📱 WhatsApp: 9154669035</li>
            <li>📧 Email: contact@kapilagro.com</li>
            <li>📞 Phone: 9154669033</li>
            <li>💬 Live Chat: Available on our website</li>
          </ul>
        </div>
      )
    },
    {
      id: 7,
      question: "Do you provide delivery services?",
      answer: "Yes, we offer nationwide delivery with secure packaging to ensure your plants arrive healthy and ready to flourish. Delivery times vary by location, and we provide tracking information for all shipments."
    },
    {
      id: 8,
      question: "Can you help with garden design and planning?",
      answer: "Our expert team offers garden design consultation services to help you create beautiful, sustainable landscapes. From small balcony gardens to large commercial spaces, we provide tailored solutions that match your vision and budget."
    }
  ];

  const toggleItem = (id) => {
    setActiveItem(activeItem === id ? null : id);
  };

  return (
    <section className="faq-section">
      <div className="section-header-1">
        <h2 className="section-title">Frequently Asked Questions</h2>
      </div>

      <div className="faq-container">
        {faqData.map((item) => (
          <div 
            key={item.id} 
            className={`faq-item ${activeItem === item.id ? 'active' : ''}`}
          >
            <button 
              className="faq-question"
              onClick={() => toggleItem(item.id)}
              aria-expanded={activeItem === item.id}
              aria-controls={`answer-${item.id}`}
            >
              <span className="question-text">{item.question}</span>
              <span className="icon1" role="img" aria-label={activeItem === item.id ? 'Collapse' : 'Expand'}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            <div 
              className="faq-answer"
              id={`answer-${item.id}`}
              role="region"
              aria-labelledby={`question-${item.id}`}
            >
              <div className="answer-content">
                {typeof item.answer === 'string' ? (
                  <p>{item.answer}</p>
                ) : (
                  item.answer
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;