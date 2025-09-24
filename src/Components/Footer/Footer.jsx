import React, { useState } from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGem,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons';
import {
  faWhatsapp,
  faInstagram,
  faFacebookF,
  faTwitter,
  faLinkedinIn,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import TermsAndConditions from '../QuickLinks/TermsAndConditions';
import PrivacyPolicy from '../QuickLinks/PrivacyPolicy';
import ShippingPolicy from '../QuickLinks/ShippingPolicy';
import RefundPolicy from '../QuickLinks/RefundPolicy';
import companyProfile from './Brochure - Kapil Agro_Brochure (1).pdf';
import exhibitionBrochure from './kapil Agro Exhibition brochure.pdf';
import kapilFlyers from './kapil agro flyers (1).pdf';
import productBrochure from './Product Brochue - Kapil Agro - Simaks Global.pdf';

const Footer = () => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);

  return (
    <footer id="footer" className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-column company-info">
            <div className="company-logo">
              <FontAwesomeIcon icon={faGem} />
              <span>Kapil Agro</span>
            </div>
            <p className="company-description">
              Kapil Agro is a trusted partner for sustainable agriculture,
              offering premium fertilizers, seeds, and organic solutions that
              nurture soil health and improve crop yields. With a mission to
              blend innovation and traditional wisdom, we help farmers produce
              safe, chemical-free food while protecting our environment for
              future generations.
            </p>
            <div className="social-links">
              <a href="https://wa.me/917416169043" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
                <FontAwesomeIcon icon={faWhatsapp} />
              </a>
              <a href="https://www.instagram.com/kapilagrofarm/" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="https://www.facebook.com/kapilagrofarm" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="#" className="social-link twitter">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="https://www.linkedin.com/company/kapil-agro/" target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>
              <a href="https://www.youtube.com/@KapilAgro" target="_blank" rel="noopener noreferrer" className="social-link youtube">
                <FontAwesomeIcon icon={faYoutube} />
              </a>
            </div>
          </div>

          {/* Customer Service */}
          <div className="footer-column">
            <h3>Customer Service</h3>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li>
                <a href="mailto:career@kapilagro.com" target="_blank" className="email-link">
                  <FontAwesomeIcon icon={faEnvelope} />
                  Careers
                </a>
              </li>
            </ul>

            {/* Brochures */}
            <div className="brochures">
              <h3>Brochures</h3>
              <div className="download-links">
                <a href={companyProfile} download className="download-link">
                  <FontAwesomeIcon icon={faFilePdf} />
                  <span>Company Profile</span>
                </a>
                <a href={exhibitionBrochure} download className="download-link">
                  <FontAwesomeIcon icon={faFilePdf} />
                  <span>Exhibition Brochure</span>
                </a>
                <a href={kapilFlyers} download className="download-link">
                  <FontAwesomeIcon icon={faFilePdf} />
                  <span>Kapil Agro Flyers</span>
                </a>
                <a href={productBrochure} download className="download-link">
                  <FontAwesomeIcon icon={faFilePdf} />
                  <span>Product Brochure</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="quick-links-column">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <span onClick={() => setIsTermsOpen(true)}>
                  Terms & Conditions
                </span>
              </li>
              <li>
                <span onClick={() => setIsPrivacyOpen(true)}>
                  Privacy Policy
                </span>
              </li>
              <li>
                <span onClick={() => setIsShippingOpen(true)}>
                  Shipping Policy
                </span>
              </li>
              <li>
                <span onClick={() => setIsRefundOpen(true)}>
                  Refund Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-column contact-info">
            <h3>Contact Us</h3>
            <div className="contact-details">
              <div className="contact-item">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>
                  Sy. No. 121, Sriram Nagar Village<br />
                  Moinabad Mandal, Hyderabad<br />
                  Telangana, India - 500075
                </span>
              </div>
              <div className="contact-item">
                <FontAwesomeIcon icon={faPhone} />
                <div className="contact-numbers">
                  <a href="tel:+919154669035" className="phone-link">+91 9154 669 035</a>
                  <a href="tel:+919154669033" className="phone-link">+91 9154 669 033</a>
                </div>
              </div>
              <div className="contact-item">
                <FontAwesomeIcon icon={faEnvelope} />
                <a href="mailto:contact@kapilagro.com" target="_blank" className="email-link">
                  contact@kapilagro.com
                </a>
              </div>
              <div className="contact-item">
                <FontAwesomeIcon icon={faClock} />
                <span>Every Day 9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section">
          <h3>Find Our Location</h3>
          <div className="footer-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3810.058836807959!2d78.26801797489195!3d17.26438820633746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcbc08d537bfcc9%3A0xa4e5a5dc8bcb9c6f!2sKapil%20Agro%20Farms!5e0!3m2!1sen!2sin!4v1739809848679!5m2!1sen!2sin"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Kapil Agro Location"
            ></iframe>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2025 Kapil Agro Pvt Ltd. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TermsAndConditions isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyPolicy isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <ShippingPolicy isOpen={isShippingOpen} onClose={() => setIsShippingOpen(false)} />
      <RefundPolicy isOpen={isRefundOpen} onClose={() => setIsRefundOpen(false)} />
    </footer>
  );
};

export default Footer;