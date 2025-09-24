import React from 'react';
import { Leaf, Shield, Truck, Clock } from 'lucide-react';
import './FreshLanding.css';

const FreshLanding = () => {
  return (
    <div id="fresh-landing" className="main">
      {/* Features Section */}
      <div className="features">
        <div className="features-inner">
          <div className="features-title">
            <p>Experience unmatched quality and care in every step</p>
          </div>
          
          <div className="features-grid">
            <div className="card">
              <div className="card-bg green"></div>
              <div className="card-inner">
                <div className="icon green">
                  <Leaf className="icon-img" />
                </div>
                <h3>Fresh Products</h3>
                <p>Handpicked, naturally grown plants from trusted farmers, ensuring vibrant greenery for your spaces.</p>
              </div>
            </div>

            <div className="card">
              <div className="card-bg blue"></div>
              <div className="card-inner">
                <div className="icon blue">
                  <Shield className="icon-img" />
                </div>
                <h3>Safe Packaging</h3>
                <p>Each plant is carefully packed using eco-friendly materials to arrive in perfect condition at your home.</p>
              </div>
            </div>

            <div className="card">
              <div className="card-bg orange"></div>
              <div className="card-inner">
                <div className="icon orange">
                  <Truck className="icon-img" />
                </div>
                <h3>Fast Delivery</h3>
                <p>Swift and reliable doorstep delivery so you can enjoy your plants without long waiting times.</p>
              </div>
            </div>

            <div className="card">
              <div className="card-bg purple"></div>
              <div className="card-inner">
                <div className="icon purple">
                  <Clock className="icon-img" />
                </div>
                <h3>24/7 Support</h3>
                <p>Our support team is always ready to assist you with queries, orders, or plant care tips—anytime you need us.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreshLanding;