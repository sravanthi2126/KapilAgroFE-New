import React from 'react';
import './RefundPolicy.css';

const RefundPolicy = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="refund-overlay">
      <div className="refund-container">
        <div className="refund-header">
          <h1>Refund Policy</h1>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <div className="refund-content">
          <div className="welcome-section">
            <h2>Thank You for Purchasing from KapilAgro</h2>
            <p>
              We strive to ensure that all our nursery plants and agricultural products arrive in perfect condition. 
              This comprehensive refund policy outlines the procedures, conditions, and guidelines for returns, 
              exchanges, and refunds for all purchases made through our website using Razorpay payment services.
            </p>
          </div>

          <div className="refund-section">
            <h3>1. Plant Health Guarantee</h3>
            <ul>
              <li>All plants are carefully inspected by our experts before shipping to ensure quality.</li>
              <li>Plants are guaranteed to arrive alive and in good condition when delivered.</li>
              <li>Our guarantee covers plants for 7 days from the delivery date.</li>
              <li>Guarantee is valid only if the provided care instructions are followed properly.</li>
              <li>Each plant comes with specific care guidelines tailored to its variety and season.</li>
              <li>We use professional packaging methods to minimize transit stress on plants.</li>
              <li>Temperature-controlled shipping available for sensitive plant varieties.</li>
            </ul>
          </div>

          <div className="refund-section">
            <h3>2. Refund Eligibility Criteria</h3>
            
            <div className="eligibility-subsection eligible">
              <h4>✅ Eligible for Refund/Replacement:</h4>
              <ul>
                <li>Dead on Arrival (DOA) - Plants that arrive completely dead or dying.</li>
                <li>Incorrect items sent - Different variety or species than ordered.</li>
                <li>Missing items from your order that were charged but not delivered.</li>
                <li>Plants with visible disease symptoms not caused by customer neglect.</li>
                <li>Plants with pest infestations present upon arrival.</li>
                <li>Severely damaged plants due to shipping mishandling.</li>
                <li>Plants that don't match the size specifications mentioned in the listing.</li>
                <li>Quality issues reported within 7 days of delivery with proper documentation.</li>
              </ul>
            </div>

            <div className="eligibility-subsection not-eligible">
              <h4>❌ Not Eligible for Refund:</h4>
              <ul>
                <li>Damage from customer neglect, overwatering, or underwatering.</li>
                <li>Transplant shock - Natural stress from repotting or environmental change.</li>
                <li>Weather-related damage after delivery (frost, heat, storms).</li>
                <li>Issues arising from improper repotting techniques.</li>
                <li>Order cancellations after shipping has commenced.</li>
                <li>Seasonal dormancy - Natural plant behavior during certain seasons.</li>
                <li>Minor cosmetic issues like yellowing of older leaves.</li>
                <li>Plants damaged due to customer's failure to follow care instructions.</li>
                <li>Issues reported after the 7-day guarantee period has expired.</li>
              </ul>
            </div>
          </div>

          <div className="refund-section">
            <h3>3. Step-by-Step Refund Process</h3>
            
            <div className="process-step">
              <h4>Step 1: Document the Issue (Within 24 Hours)</h4>
              <ul>
                <li>Take clear, high-resolution photos of the plant and packaging immediately.</li>
                <li>For DOA cases, photograph before unpacking to show shipping condition.</li>
                <li>Capture multiple angles showing the issue clearly.</li>
                <li>Include the plant label/tag in the photos for identification.</li>
                <li>Document any packaging damage that may have caused the issue.</li>
                <li>Keep the original packaging materials for inspection if needed.</li>
              </ul>
            </div>

            <div className="process-step">
              <h4>Step 2: Contact Customer Support (Within 4 Days)</h4>
              <ul>
                <li>Email us at support@kapilagro.com with all relevant information.</li>
                <li>Include your order number in the subject line for faster processing.</li>
                <li>Attach the photos taken in Step 1 to your email.</li>
                <li>Provide a detailed description of the issue and its timeline.</li>
                <li>Mention any care steps you've already taken.</li>
                <li>Include your contact information for follow-up communication.</li>
              </ul>
            </div>

            <div className="process-step">
              <h4>Step 3: Assessment and Review (48 Business Hours)</h4>
              <ul>
                <li>Our expert team will assess your case within 48 business hours.</li>
                <li>We may request additional photos or information if needed.</li>
                <li>Our horticulturists will review the case for final determination.</li>
                <li>You'll receive a case number for tracking your refund request.</li>
                <li>We may offer care advice to help save the plant if possible.</li>
                <li>Complex cases may require consultation with plant specialists.</li>
              </ul>
            </div>

            <div className="process-step">
              <h4>Step 4: Resolution Options</h4>
              <ul>
                <li>Replacement plant (if the same variety is available in stock).</li>
                <li>Store credit for the full purchase amount (no expiry date).</li>
                <li>Full refund to your original payment method.</li>
                <li>Partial refund with care guidance for recoverable plants.</li>
                <li>Exchange for a different plant variety of similar value.</li>
                <li>Combination of store credit and plant care consultation.</li>
              </ul>
            </div>
          </div>

          <div className="refund-section">
            <h3>4. Razorpay Payment Refunds</h3>
            <ul>
              <li>All refunds are processed through Razorpay to your original payment method.</li>
              <li>Refunds typically appear in your account within 5–7 business days.</li>
              <li>Credit card refunds may take 7-10 business days depending on your bank.</li>
              <li>UPI and digital wallet refunds are usually instant to 24 hours.</li>
              <li>Bank transfer refunds may take 3-5 business days to reflect.</li>
              <li>You'll receive a refund confirmation email with transaction details.</li>
              <li>Shipping charges are refunded only if the issue is due to our error.</li>
              <li>Processing fees are waived for valid refund claims.</li>
            </ul>
          </div>

          <div className="refund-section">
            <h3>5. Order Cancellations</h3>
            <ul>
              <li>Orders may be cancelled before shipping for a 100% full refund.</li>
              <li>Cancellation requests must be made within 2 hours of order placement.</li>
              <li>Once shipped, orders fall under this policy's return terms.</li>
              <li>Cancellations during processing may incur a 10% handling fee.</li>
              <li>Custom or special orders cannot be cancelled once preparation begins.</li>
              <li>Bulk orders have different cancellation terms (contact support).</li>
              <li>Weekend orders can be cancelled until Monday morning without penalty.</li>
            </ul>
          </div>

          <div className="refund-section">
            <h3>6. Live Plant Considerations and Natural Variations</h3>
            <ul>
              <li>Minor variations in plant size, leaf color, or shape are natural and expected.</li>
              <li>Seasonal dormancy is a natural process and not grounds for refund.</li>
              <li>Flower colors may vary slightly from photos due to natural genetics.</li>
              <li>Leaf drop during transit is normal and plants usually recover quickly.</li>
              <li>Young plants may look different from mature plants in photographs.</li>
              <li>Slight wilting upon arrival is normal - most plants recover with proper care.</li>
              <li>Variegated plants may show variation in pattern intensity.</li>
              <li>Fruit/flower production timelines depend on plant maturity and conditions.</li>
            </ul>
          </div>

          <div className="refund-section">
            <h3>7. Seasonal and Weather Considerations</h3>
            <ul>
              <li>Monsoon season deliveries may require special care upon arrival.</li>
              <li>Summer shipping includes heat protection measures for sensitive plants.</li>
              <li>Winter deliveries may show temporary cold stress (usually recoverable).</li>
              <li>Extreme weather delays are not covered under refund policy.</li>
              <li>Seasonal plants may enter dormancy during certain months.</li>
              <li>Planting season rushes may extend processing times.</li>
              <li>Festival seasons may affect delivery schedules and plant availability.</li>
            </ul>
          </div>

          <div className="refund-section">
            <h3>8. Care Instructions and Support</h3>
            <ul>
              <li>Every plant comes with detailed care instructions specific to its variety.</li>
              <li>Free consultation available for plant care questions within 30 days.</li>
              <li>Video care guides available on our website and YouTube channel.</li>
              <li>WhatsApp support for quick care tips and troubleshooting.</li>
              <li>Seasonal care updates sent via email to customers.</li>
              <li>Plant care workshops conducted regularly (online and offline).</li>
              <li>Community forum for plant enthusiasts to share experiences.</li>
            </ul>
          </div>

          <div className="refund-section">
            <h3>9. Replacement and Exchange Process</h3>
            <ul>
              <li>Replacement plants are sent free of charge for valid claims.</li>
              <li>We'll coordinate pickup of the damaged plant if required.</li>
              <li>Replacement plants are prioritized and shipped within 2-3 business days.</li>
              <li>If exact variety unavailable, we'll offer similar or upgraded alternatives.</li>
              <li>Exchange for different varieties allowed within 7 days of delivery.</li>
              <li>Upgrade options available by paying the price difference.</li>
              <li>Seasonal replacements may be delayed until appropriate planting time.</li>
            </ul>
          </div>

          <div className="refund-section">
            <h3>10. Special Categories and Exclusions</h3>
            <ul>
              <li>Rare and exotic plants have extended 14-day guarantee period.</li>
              <li>Seeds and bulbs have different germination guarantees (refer to product page).</li>
              <li>Grafted plants may show initial stress - 14-day adjustment period allowed.</li>
              <li>Bonsai plants require specialized care - consultation provided.</li>
              <li>Aquatic plants have specific water quality requirements for guarantee.</li>
              <li>Carnivorous plants need special care conditions for health guarantee.</li>
              <li>Medicinal plants come with usage guidelines and contraindications.</li>
            </ul>
          </div>

          <div className="refund-section">
            <h3>11. Customer Responsibilities</h3>
            <ul>
              <li>Inspect plants immediately upon delivery and report issues quickly.</li>
              <li>Follow provided care instructions accurately for guarantee validity.</li>
              <li>Provide honest and detailed information about plant care provided.</li>
              <li>Allow reasonable time for plant recovery before claiming refund.</li>
              <li>Maintain plants in appropriate conditions as specified.</li>
              <li>Keep order confirmation and delivery receipts for reference.</li>
              <li>Respond promptly to our support team's queries and requests.</li>
            </ul>
          </div>

          <div className="refund-section">
            <h3>12. Contact Information and Support</h3>
            <p>
              For any refund, return, or plant care queries, please contact our customer support team:
            </p>
            <ul>
              <li>Email: support@kapilagro.com (Primary support channel)</li>
              <li>Phone: +91-XXXX-XXXXX</li>
              <li>WhatsApp: +91-XXXXX-XXXXX (Quick queries and photo sharing)</li>
              <li>Support Hours: Monday–Saturday, 10:00 AM–6:00 PM IST</li>
              <li>Emergency Plant Care: 24/7 WhatsApp support for critical issues</li>
              <li>Video Call Consultation: Available for complex plant problems</li>
              <li>Regional Language Support: Hindi, Telugu, Tamil available</li>
            </ul>
          </div>

          <div className="refund-section agreement-section">
            <h3>Policy Agreement and Updates</h3>
            <p>
              This refund policy may be updated at any time to reflect changes in our processes, 
              seasonal considerations, or regulatory requirements. All changes are effective 
              immediately upon posting on our website.
            </p>
            <p>
              By purchasing from KapilAgro, you acknowledge that you have read, understood, and 
              agree to be bound by this refund policy. We are committed to fair and transparent 
              refund processes that protect both our customers and our business.
            </p>
            <p>
              We appreciate your trust in KapilAgro and are dedicated to helping you succeed 
              in your gardening and agricultural endeavors.
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

export default RefundPolicy;