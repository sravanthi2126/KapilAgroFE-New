import React from 'react';
import './ShippingPolicy.css';

const ShippingPolicy = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="shipping-overlay">
      <div className="shipping-container">
        <div className="shipping-header">
          <h1>Shipping Policy</h1>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <div className="shipping-content">
          <div className="welcome-section">
            <h2>Thank You for Shopping with KapilAgro</h2>
            <p>
              We are committed to delivering your agricultural products safely and efficiently. 
              Please review our comprehensive shipping policy to understand our delivery process, 
              timelines, and terms.
            </p>
          </div>

          <div className="shipping-section">
            <h3>1. Order Processing Time</h3>
            <ul>
              <li>All orders are processed within 1-2 business days after payment confirmation.</li>
              <li>Orders placed on weekends or holidays will be processed the next business day.</li>
              <li>During peak seasons (planting/harvesting), processing may take up to 3 business days.</li>
              <li>Custom or bulk orders may require additional processing time of 3-5 business days.</li>
              <li>We will send you an email confirmation once your order has been processed and shipped.</li>
              <li>Orders are processed Monday through Friday, excluding national holidays.</li>
            </ul>
          </div>

          <div className="shipping-section">
            <h3>2. Delivery Timeframes</h3>
            <ul>
              <li>Standard shipping time: 3-7 business days depending on your location.</li>
              <li>Metro cities: 2-4 business days for most products.</li>
              <li>Tier-2 cities: 4-6 business days for standard delivery.</li>
              <li>Rural areas: 5-8 business days, subject to courier availability.</li>
              <li>Remote locations may require additional 2-3 days for delivery.</li>
              <li>Express delivery available in select cities for urgent orders (additional charges apply).</li>
              <li>Live plants and perishable items are prioritized for faster delivery.</li>
            </ul>
          </div>

          <div className="shipping-section">
            <h3>3. Shipping Costs and Fees</h3>
            <ul>
              <li>Standard shipping fee of ₹49 applies to all orders regardless of size.</li>
              <li>Free shipping on orders above ₹999 within India (except remote locations).</li>
              <li>Express delivery charges: ₹149 for metro cities, ₹199 for other areas.</li>
              <li>Remote location surcharge: Additional ₹99 for hard-to-reach areas.</li>
              <li>Bulk orders above 50kg may incur additional freight charges.</li>
              <li>Cash on Delivery (COD) available with ₹25 handling fee.</li>
              <li>No hidden charges - all shipping costs are displayed at checkout.</li>
            </ul>
          </div>

          <div className="shipping-section">
            <h3>4. Packaging and Product Care</h3>
            <ul>
              <li>Plants are carefully packaged to ensure they arrive in healthy condition.</li>
              <li>Live plants are packed with moisture-retaining materials and proper ventilation.</li>
              <li>Seeds are sealed in moisture-proof containers to maintain viability.</li>
              <li>Fertilizers and chemicals are packaged according to safety regulations.</li>
              <li>Fragile items like pots and tools are wrapped with protective materials.</li>
              <li>All packages are labeled with handling instructions for delivery personnel.</li>
              <li>Temperature-sensitive products are shipped with appropriate cooling/heating packs when necessary.</li>
            </ul>
          </div>

          <div className="shipping-section">
            <h3>5. Delivery Coverage Areas</h3>
            <ul>
              <li>We currently ship to most areas across India through our courier partners.</li>
              <li>Delivery available in all major cities and towns in India.</li>
              <li>Some remote locations in hilly or tribal areas may require additional delivery time.</li>
              <li>PIN code verification available at checkout to confirm delivery availability.</li>
              <li>Island territories (Andaman, Lakshadweep) have special shipping arrangements.</li>
              <li>Border areas may have delivery restrictions due to security regulations.</li>
              <li>International shipping currently not available.</li>
            </ul>
          </div>

          <div className="shipping-section">
            <h3>6. Order Tracking and Communication</h3>
            <ul>
              <li>You will receive a tracking number once your order ships via SMS and email.</li>
              <li>Real-time tracking available through our website and courier partner apps.</li>
              <li>SMS notifications sent at key delivery milestones.</li>
              <li>Email updates for any delays or delivery rescheduling.</li>
              <li>Customer support available for tracking queries during business hours.</li>
              <li>Delivery confirmation with recipient details and timestamp.</li>
              <li>Photo proof of delivery available upon request.</li>
            </ul>
          </div>

          <div className="shipping-section">
            <h3>7. Delivery Process and Requirements</h3>
            <ul>
              <li>Delivery attempts made during business hours (9 AM to 7 PM).</li>
              <li>Recipient or authorized person must be available to receive the delivery.</li>
              <li>Valid ID required for high-value orders and COD deliveries.</li>
              <li>Delivery address cannot be changed once the order has shipped.</li>
              <li>Three delivery attempts will be made before returning to origin.</li>
              <li>Safe drop-off available for pre-paid orders with customer consent.</li>
              <li>Apartment/society delivery coordination through security/management.</li>
            </ul>
          </div>

          <div className="shipping-section">
            <h3>8. Delays and Force Majeure</h3>
            <ul>
              <li>Delivery delays may occur due to weather conditions or other factors beyond our control.</li>
              <li>Monsoon season may affect delivery timelines in certain regions.</li>
              <li>Natural disasters, strikes, or political unrest may cause temporary delays.</li>
              <li>Festival seasons may extend delivery times due to increased volume.</li>
              <li>COVID-19 related restrictions may impact delivery schedules.</li>
              <li>Road closures or transportation strikes beyond our control.</li>
              <li>We will proactively communicate any expected delays via email/SMS.</li>
            </ul>
          </div>

          <div className="shipping-section">
            <h3>9. Special Handling Instructions</h3>
            <ul>
              <li>Live plants require immediate attention upon delivery - unpack carefully.</li>
              <li>Water live plants immediately if soil appears dry.</li>
              <li>Seeds should be stored in cool, dry conditions until use.</li>
              <li>Fertilizers and chemicals must be stored as per label instructions.</li>
              <li>Inspect packages immediately upon delivery and report damages within 24 hours.</li>
              <li>Take photos of damaged packages before opening for insurance claims.</li>
              <li>Follow seasonal planting guidelines provided with your plants.</li>
            </ul>
          </div>

          <div className="shipping-section">
            <h3>10. Delivery Issues and Resolution</h3>
            <ul>
              <li>Report non-delivery within 48 hours of expected delivery date.</li>
              <li>Damaged items must be reported within 24 hours with photo evidence.</li>
              <li>Missing items from partial deliveries should be reported immediately.</li>
              <li>Wrong product delivered will be replaced at no additional cost.</li>
              <li>Refund or replacement options available for delivery failures.</li>
              <li>Customer support team available for all delivery-related issues.</li>
              <li>Escalation process in place for unresolved delivery problems.</li>
            </ul>
          </div>

          <div className="shipping-section">
            <h3>11. Seasonal and Special Considerations</h3>
            <ul>
              <li>Planting season orders are prioritized for timely delivery.</li>
              <li>Monsoon deliveries may be delayed to protect live plants.</li>
              <li>Summer shipping of plants includes extra care instructions.</li>
              <li>Winter shipping may include frost protection for sensitive plants.</li>
              <li>Festival season orders should be placed well in advance.</li>
              <li>Agricultural exhibition periods may see increased delivery times.</li>
              <li>School/college season may affect delivery to educational institutions.</li>
            </ul>
          </div>

          <div className="shipping-section">
            <h3>12. Customer Support and Contact</h3>
            <p>
              For any shipping-related queries, please contact our customer support team:
            </p>
            <ul>
              <li>Email: shipping@kapilagro.com</li>
              <li>Phone: +91-XXXX-XXXXX (Monday to Saturday, 9 AM to 7 PM)</li>
              <li>WhatsApp: +91-XXXXX-XXXXX for quick queries</li>
              <li>Live Chat: Available on our website during business hours</li>
              <li>Support Ticket: Submit through your account dashboard</li>
              <li>Regional Support: Local language assistance available</li>
              <li>Emergency Contact: For urgent delivery issues</li>
            </ul>
          </div>

          <div className="shipping-section agreement-section">
            <h3>Shipping Agreement</h3>
            <p>
              By proceeding with the purchase, you agree to our shipping terms and conditions. 
              You acknowledge that delivery times are estimates and may vary due to factors 
              beyond our control. Please ensure someone is available to receive your order 
              during the estimated delivery window.
            </p>
            <p>
              We are committed to providing the best shipping experience possible and will 
              work diligently to resolve any issues that may arise during the delivery process.
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

export default ShippingPolicy;