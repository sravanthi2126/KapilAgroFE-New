import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="privacy-overlay">
      <div className="privacy-container">
        <div className="privacy-header">
          <h1>Privacy Policy</h1>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <div className="privacy-content">
          <div className="welcome-section">
            <h2>Your Privacy is Important to Us</h2>
            <p>
              At KapilAgro, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This comprehensive privacy policy explains how we collect, use, store, and protect your data when you use our 
              website and services. We believe in transparency and want you to understand exactly how your information is handled.
            </p>
          </div>

          <div className="privacy-section">
            <h3>1. Information We Collect</h3>
            
            <div className="info-subsection">
              <h4>Personal Information</h4>
              <ul>
                <li>Name and contact details (phone number, email address)</li>
                <li>Shipping and billing addresses for order processing</li>
                <li>Age and date of birth (for age-restricted products if applicable)</li>
                <li>Business information for commercial customers</li>
                <li>Communication preferences and language settings</li>
                <li>Customer service interaction records and feedback</li>
                <li>Account credentials and security information</li>
              </ul>
            </div>

            <div className="info-subsection">
              <h4>Order and Transaction Information</h4>
              <ul>
                <li>Purchase history and order details</li>
                <li>Product preferences and wishlist items</li>
                <li>Payment method information (processed through Razorpay)</li>
                <li>Delivery preferences and special instructions</li>
                <li>Return and refund request information</li>
                <li>Customer reviews and ratings</li>
              </ul>
            </div>

            <div className="info-subsection">
              <h4>Technical Information</h4>
              <ul>
                <li>IP address and device information</li>
                <li>Browser type, version, and operating system</li>
                <li>Website usage patterns and page visits</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Location data (with your permission)</li>
                <li>Mobile app usage statistics</li>
              </ul>
            </div>
          </div>

          <div className="privacy-section">
            <h3>2. How We Use Your Information</h3>
            
            <div className="usage-category">
              <h4>Order Processing and Service Delivery</h4>
              <ul>
                <li>Processing and fulfilling your orders efficiently</li>
                <li>Communicating about order status, shipping, and delivery</li>
                <li>Providing customer support and resolving issues</li>
                <li>Managing returns, exchanges, and refunds</li>
                <li>Personalizing your shopping experience</li>
                <li>Maintaining accurate customer accounts and records</li>
              </ul>
            </div>

            <div className="usage-category">
              <h4>Communication and Marketing</h4>
              <ul>
                <li>Sending order confirmations and shipping notifications</li>
                <li>Providing plant care tips and seasonal gardening advice</li>
                <li>Sharing promotions, discounts, and special offers</li>
                <li>Announcing new products and services</li>
                <li>Conducting customer satisfaction surveys</li>
                <li>Sending newsletters and educational content</li>
              </ul>
            </div>

            <div className="usage-category">
              <h4>Service Improvement and Analytics</h4>
              <ul>
                <li>Analyzing website usage to improve user experience</li>
                <li>Understanding customer preferences and buying patterns</li>
                <li>Developing new products and services</li>
                <li>Conducting market research and business analysis</li>
                <li>Preventing fraud and ensuring platform security</li>
                <li>Complying with legal and regulatory requirements</li>
              </ul>
            </div>
          </div>

          <div className="privacy-section">
            <h3>3. Information Sharing and Disclosure</h3>
            
            <div className="sharing-policy">
              <h4>What We DON'T Do</h4>
              <ul>
                <li>We do not sell, trade, or rent your personal information to third parties</li>
                <li>We do not share your data with advertisers without consent</li>
                <li>We do not sell customer lists or contact information</li>
                <li>We do not use your data for unrelated commercial purposes</li>
                <li>We do not share sensitive information unnecessarily</li>
              </ul>
            </div>

            <div className="sharing-policy">
              <h4>Authorized Sharing (Limited Circumstances)</h4>
              <ul>
                <li>Shipping partners for order delivery (address information only)</li>
                <li>Payment processors (Razorpay) for transaction processing</li>
                <li>Customer service providers for support purposes</li>
                <li>Legal authorities when required by law or court orders</li>
                <li>Business partners for joint promotions (with your explicit consent)</li>
                <li>Analytics providers for website improvement (anonymized data)</li>
              </ul>
            </div>
          </div>

          <div className="privacy-section">
            <h3>4. Payment Security and Razorpay Integration</h3>
            <ul>
              <li>All payment information is processed securely through Razorpay's certified platform</li>
              <li>We do not store credit card, debit card, or banking information on our servers</li>
              <li>Payment data is encrypted using industry-standard SSL/TLS protocols</li>
              <li>Razorpay complies with PCI DSS (Payment Card Industry Data Security Standard)</li>
              <li>We only receive transaction confirmation and order details, not payment credentials</li>
              <li>All financial transactions are monitored for fraud prevention</li>
              <li>Refunds are processed through the same secure Razorpay system</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h3>5. Data Storage and Security Measures</h3>
            
            <div className="security-category">
              <h4>Technical Safeguards</h4>
              <ul>
                <li>Advanced encryption for data transmission and storage</li>
                <li>Secure server infrastructure with regular security updates</li>
                <li>Multi-factor authentication for admin access</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Automated backup systems with secure off-site storage</li>
                <li>Firewall protection and intrusion detection systems</li>
              </ul>
            </div>

            <div className="security-category">
              <h4>Organizational Measures</h4>
              <ul>
                <li>Limited access to personal data on a need-to-know basis</li>
                <li>Employee training on data protection and privacy practices</li>
                <li>Confidentiality agreements for all staff handling customer data</li>
                <li>Regular review and update of privacy and security policies</li>
                <li>Incident response procedures for potential data breaches</li>
                <li>Compliance monitoring and internal audits</li>
              </ul>
            </div>
          </div>

          <div className="privacy-section">
            <h3>6. Cookies and Tracking Technologies</h3>
            
            <div className="cookies-category">
              <h4>Essential Cookies</h4>
              <ul>
                <li>Session management and user authentication</li>
                <li>Shopping cart functionality and checkout process</li>
                <li>Security features and fraud prevention</li>
                <li>Language preferences and accessibility settings</li>
              </ul>
            </div>

            <div className="cookies-category">
              <h4>Analytics and Performance Cookies</h4>
              <ul>
                <li>Google Analytics for website usage statistics</li>
                <li>Page load performance monitoring</li>
                <li>User behavior analysis for UX improvements</li>
                <li>A/B testing for feature optimization</li>
              </ul>
            </div>

            <div className="cookies-category">
              <h4>Marketing Cookies (Optional)</h4>
              <ul>
                <li>Personalized product recommendations</li>
                <li>Targeted advertising on social media platforms</li>
                <li>Email marketing campaign effectiveness</li>
                <li>Retargeting for abandoned cart recovery</li>
              </ul>
            </div>
          </div>

          <div className="privacy-section">
            <h3>7. Your Rights and Choices</h3>
            
            <div className="rights-category">
              <h4>Access and Control</h4>
              <ul>
                <li>View and download your personal information and order history</li>
                <li>Update your contact information and preferences anytime</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt-out of marketing communications while keeping order notifications</li>
                <li>Control cookie preferences through browser settings</li>
                <li>Request data portability to another service provider</li>
              </ul>
            </div>

            <div className="rights-category">
              <h4>Communication Preferences</h4>
              <ul>
                <li>Choose which types of emails you want to receive</li>
                <li>Set frequency preferences for promotional communications</li>
                <li>Select preferred communication channels (email, SMS, phone)</li>
                <li>Update language and regional preferences</li>
                <li>Manage notification settings for mobile app</li>
              </ul>
            </div>
          </div>

          <div className="privacy-section">
            <h3>8. Data Retention and Deletion</h3>
            <ul>
              <li>Personal information is retained only as long as necessary for business purposes</li>
              <li>Order history maintained for 7 years for tax and legal compliance</li>
              <li>Marketing data deleted within 2 years of last interaction if opted out</li>
              <li>Inactive accounts may be archived after 3 years of no activity</li>
              <li>Customer service records kept for 5 years for quality assurance</li>
              <li>Technical logs and analytics data anonymized after 2 years</li>
              <li>Right to request immediate deletion in specific circumstances</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h3>9. Third-Party Services and Integrations</h3>
            
            <div className="third-party-category">
              <h4>Shipping and Logistics Partners</h4>
              <ul>
                <li>Delivery address shared only for order fulfillment</li>
                <li>Phone number provided for delivery coordination</li>
                <li>Package tracking information managed by courier services</li>
                <li>Special delivery instructions communicated when necessary</li>
              </ul>
            </div>

            <div className="third-party-category">
              <h4>Technology Service Providers</h4>
              <ul>
                <li>Cloud hosting services for website infrastructure</li>
                <li>Email service providers for communication</li>
                <li>Analytics platforms for website performance monitoring</li>
                <li>Customer support tools for service management</li>
              </ul>
            </div>
          </div>

          <div className="privacy-section">
            <h3>10. International Data Transfers</h3>
            <ul>
              <li>Data primarily stored and processed within India</li>
              <li>Some third-party services may involve international data transfers</li>
              <li>All international transfers comply with applicable data protection laws</li>
              <li>Appropriate safeguards in place for cross-border data sharing</li>
              <li>Service providers contractually bound to protect your data</li>
              <li>Right to object to international transfers in certain circumstances</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h3>11. Children's Privacy</h3>
            <ul>
              <li>Our services are not directed to children under 13 years of age</li>
              <li>We do not knowingly collect personal information from children</li>
              <li>Parental consent required for users under 18 years of age</li>
              <li>Educational content may be suitable for supervised children</li>
              <li>Parents can request deletion of their child's information</li>
              <li>Special protection measures for any child-related data</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h3>12. Updates and Changes to Privacy Policy</h3>
            <ul>
              <li>This policy may be updated periodically to reflect changes in practices</li>
              <li>Material changes will be communicated via email and website notification</li>
              <li>Continued use of services constitutes acceptance of updated policy</li>
              <li>Historical versions available upon request</li>
              <li>Right to object to policy changes and close account if desired</li>
              <li>Regular reviews conducted to ensure policy remains current and compliant</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h3>13. Contact Information and Data Requests</h3>
            <p>
              For any privacy-related questions, data requests, or concerns, please contact us:
            </p>
            <ul>
              <li>Email: privacy@kapilagro.com (dedicated privacy team)</li>
              <li>General Support: support@kapilagro.com</li>
              <li>Phone: +91-XXXX-XXXXX (Monday to Saturday, 10 AM - 6 PM)</li>
              <li>Data Protection Officer: dpo@kapilagro.com</li>
              <li>Postal Address: KapilAgro Privacy Team, [Complete Address]</li>
              <li>Response time: Within 30 days for data requests</li>
              <li>Emergency privacy concerns: Available 24/7 via email</li>
            </ul>
          </div>

          <div className="privacy-section agreement-section">
            <h3>Consent and Agreement</h3>
            <p>
              By registering for an account, using our website, or making a purchase, you consent to our 
              collection and use of your information as described in this privacy policy. You acknowledge 
              that you have read and understood this policy and agree to its terms.
            </p>
            <p>
              We are committed to maintaining the highest standards of privacy protection and will continue 
              to evolve our practices to ensure your personal information remains secure and private.
            </p>
            <p>
              If you have any concerns about how your data is handled or wish to exercise any of your 
              privacy rights, please don't hesitate to contact our privacy team.
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

export default PrivacyPolicy;