import React from 'react';
import './TermsAndConditions.css';

const TermsAndConditions = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="terms-overlay">
      <div className="terms-container">
        <div className="terms-header">
          <h1>Terms and Conditions</h1>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <div className="terms-content">
          <div className="welcome-section">
            <h2>Welcome to KapilAgro</h2>
            <p>
              By using this site and registering for an account, you agree to the following terms and conditions. 
              Please read them carefully as they govern your use of our website and services.
            </p>
          </div>

          <div className="terms-section">
            <h3>1. Account Registration and Information</h3>
            <ul>
              <li>You must provide accurate, current, and complete personal information while registering.</li>
              <li>You are responsible for updating your information to keep it accurate and current.</li>
              <li>You must be at least 18 years old to create an account or have parental consent.</li>
              <li>Only one account per person is allowed unless otherwise authorized by KapilAgro.</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>2. Purchases and Orders</h3>
            <ul>
              <li>All purchases made through this website are subject to availability and acceptance.</li>
              <li>We reserve the right to refuse or cancel any order at our discretion.</li>
              <li>Payment must be completed before order processing begins.</li>
              <li>Orders are processed within 1-3 business days after payment confirmation.</li>
              <li>Bulk orders may require additional processing time and verification.</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>3. Pricing and Product Information</h3>
            <ul>
              <li>Prices, product availability, and offers are subject to change without prior notice.</li>
              <li>All prices are displayed in Indian Rupees (INR) unless otherwise specified.</li>
              <li>We strive to provide accurate product descriptions and images, but variations may occur.</li>
              <li>Special offers and discounts are valid for limited periods and subject to terms.</li>
              <li>Seasonal pricing may apply to certain agricultural products.</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>4. Account Security</h3>
            <ul>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>Notify us immediately if you suspect unauthorized access to your account.</li>
              <li>Use strong passwords and change them regularly for better security.</li>
              <li>Do not share your account credentials with others.</li>
              <li>Log out from shared or public computers after use.</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>5. Prohibited Activities</h3>
            <ul>
              <li>Unauthorized use of this website may give rise to a claim for damages and/or be a criminal offense.</li>
              <li>Do not attempt to hack, disrupt, or gain unauthorized access to our systems.</li>
              <li>Fraudulent transactions or misuse of payment methods is strictly prohibited.</li>
              <li>Do not upload malicious content or spam through our platform.</li>
              <li>Respect intellectual property rights and do not copy our content without permission.</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>6. Product Quality and Returns</h3>
            <ul>
              <li>We guarantee the quality of our agricultural products as per industry standards.</li>
              <li>Returns are accepted within 7 days for non-perishable items in original condition.</li>
              <li>Perishable items cannot be returned unless there are quality issues upon delivery.</li>
              <li>Defective or damaged items will be replaced or refunded at no additional cost.</li>
              <li>Return shipping costs may apply unless the return is due to our error.</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>7. Shipping and Delivery</h3>
            <ul>
              <li>Delivery times are estimates and may vary based on location and product availability.</li>
              <li>We are not responsible for delays caused by weather conditions or transportation issues.</li>
              <li>Ensure someone is available to receive the delivery at the specified address.</li>
              <li>Additional charges may apply for remote locations or special delivery requirements.</li>
              <li>Track your order using the provided tracking information.</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>8. Privacy and Data Protection</h3>
            <ul>
              <li>Your personal information is protected according to our Privacy Policy.</li>
              <li>We use your data only for order processing, customer service, and marketing communications.</li>
              <li>You can opt out of marketing communications at any time.</li>
              <li>We do not sell or share your personal information with third parties without consent.</li>
              <li>Cookies are used to enhance your browsing experience.</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>9. Limitation of Liability</h3>
            <ul>
              <li>KapilAgro's liability is limited to the value of the products purchased.</li>
              <li>We are not responsible for indirect or consequential damages.</li>
              <li>Agricultural products are subject to natural variations and seasonal availability.</li>
              <li>Use our products according to provided guidelines and recommendations.</li>
              <li>Consult professionals for specific agricultural advice and applications.</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>10. Modifications and Updates</h3>
            <ul>
              <li>We reserve the right to modify these terms at any time without prior notice.</li>
              <li>Continued use of the site means you accept the updated terms and conditions.</li>
              <li>Major changes will be communicated through email or website notifications.</li>
              <li>Check this page regularly for updates to our terms and conditions.</li>
              <li>The most current version will always be available on our website.</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>11. Contact Information</h3>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <ul>
              <li>Email: support@kapilagro.com</li>
              <li>Phone: +91-XXXX-XXXXX</li>
              <li>Address: KapilAgro, Agricultural Solutions, India</li>
              <li>Business Hours: Monday to Friday, 9:00 AM to 6:00 PM IST</li>
            </ul>
          </div>

          <div className="terms-section agreement-section">
            <h3>Agreement</h3>
            <p>
              If you disagree with any part of these terms and conditions, please do not use our website. 
              By continuing to use KapilAgro, you acknowledge that you have read, understood, and agree 
              to be bound by these terms and conditions.
            </p>
            <p className="last-updated">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;