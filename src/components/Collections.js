import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import './Collections.css';

const Collections = () => {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    categoriesAPI.getAll()
      .then(data => {
        const cats = Array.isArray(data) ? data : data.results || [];
        if (cats.length > 0) {
          const apiCollections = cats.map(c => ({
            slug: c.slug,
            name: c.name.toUpperCase(),
            description: c.description?.toUpperCase() || '',
            image: c.image || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80',
          }));
          setCollections(apiCollections.slice(0, 4));
        }
      })
      .catch(() => {});
  }, []);

  if (collections.length === 0) return null;

  return (
    <section className="collections-section">
      <div className="section-header">
        <p className="section-label">BROWSE BY CATEGORY</p>
        <h2 className="section-title">OUR COLLECTIONS</h2>
        <div className="section-divider" />
      </div>
      <div className="collections-grid">
        {collections.map((col, i) => (
          <Link
            to={`/collections/${col.slug}`}
            key={col.slug}
            className="collection-card"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="card-image">
              <img src={col.image} alt={col.name} />
              <div className="card-overlay" />
            </div>
            <div className="card-content">
              <p className="card-subtitle">{col.description}</p>
              <h3 className="card-name">{col.name}</h3>
              <button className="card-btn">SHOP NOW</button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Collections;