
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import './Collections.css';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=900&q=85';

const getCategoryImage = (category) => {
  const image =
    category.image ||
    category.image_url ||
    category.imageUrl ||
    category.photo ||
    category.thumbnail;

  if (!image || typeof image !== 'string') {
    return FALLBACK_IMAGE;
  }

  // Keep absolute URLs, including Cloudinary URLs, unchanged.
  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  // Resolve relative media paths against the backend origin.
  const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
  const backendOrigin = apiBase.replace(/\/api\/?$/, '').replace(/\/$/, '');

  return `${backendOrigin}/${image.replace(/^\/+/, '')}`;
};

const Collections = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let isMounted = true;

    categoriesAPI
      .getAll()
      .then((data) => {
        const cats = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];

        if (isMounted) {
          setCategories(
            cats
              .filter((category) => category.is_active !== false)
              .map((category) => ({
                id: category.id,
                slug: category.slug,
                name: category.name,
                image: getCategoryImage(category),
              }))
          );
        }
      })
      .catch((error) => {
        console.error('Failed to load categories:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="categories-section">
      <div className="categories-header">
        <p className="categories-label">EXPLORE OUR STYLE</p>
        <h2 className="categories-title">OUR CATEGORIES</h2>
        <div className="categories-divider" />
        <p className="categories-description">
          Discover something beautiful for every occasion.
        </p>
      </div>

      <div className="categories-grid">
        {categories.map((category, index) => (
          <Link
            to={`/collections/${category.slug}`}
            key={category.id || category.slug}
            className="category-card"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="category-image-wrap">
              <img
                src={category.image}
                alt={category.name}
                className="category-image"
                loading="lazy"
                onError={(event) => {
                  console.error(
                    `Failed to load image for ${category.name}:`,
                    category.image
                  );
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            </div>

            <div className="category-card-content">
              <h3 className="category-name">{category.name}</h3>
              <span className="category-shop-link">
                SHOP NOW <span aria-hidden="true">↗</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Collections;
