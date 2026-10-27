import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI } from '../services/api';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistAPI.get()
      .then(data => setWishlist(data || []))
      .catch(error => {
        console.error('Failed to load wishlist:', error);
        setWishlist([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.toggle(productId);
      setWishlist(prev =>
        prev.filter(item => item.id !== productId)
      );
    } catch (error) {
      console.error('Failed to remove wishlist item:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '70vh',
      padding: '2rem',
      maxWidth: '1100px',
      margin: '0 auto'
    }}>
      <h1 style={{ marginBottom: '1.5rem' }}>
        My Wishlist
      </h1>

      {wishlist.length === 0 ? (
        <div style={{
          textAlign: 'center',
          marginTop: '4rem'
        }}>
          <p style={{
            fontSize: '1.2rem',
            color: '#888'
          }}>
            Your wishlist is empty.
          </p>

          <Link
            to="/products"
            style={{
              marginTop: '1rem',
              display: 'inline-block',
              color: '#b5813e',
              textDecoration: 'none'
            }}
          >
            Browse Products →
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.5rem'
        }}>
          {wishlist.map(item => (
            <div
              key={item.id}
              style={{
                border: '1px solid #eee',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <img
                src={item.primary_image || item.image}
                alt={item.name}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover'
                }}
              />

              <div style={{ padding: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem' }}>
                  {item.name}
                </h3>

                <p style={{
                  color: '#b5813e',
                  margin: '0 0 1rem'
                }}>
                  ₹{Number(item.price).toLocaleString('en-IN')}
                </p>

                <div style={{
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <Link
                    to={`/products/${item.slug}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '0.5rem',
                      background: '#7f1d1d',
                      color: '#fff',
                      borderRadius: '4px',
                      textDecoration: 'none'
                    }}
                  >
                    View
                  </Link>

                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;