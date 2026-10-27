
import React from "react";
import { useNavigate } from "react-router-dom";
import "./OurStory.css";

const OurStory = () => {
  const navigate = useNavigate();

  return (
    <section className="story-section">
      <div className="story-top-line" />

      <div className="story-content">
        <p className="story-label">OUR STORY</p>

        <h2 className="story-title">Where Comfort Meets You</h2>

        <p className="story-text">
          Nayra Fashions was born from a love for timeless Indian elegance.
          Every piece we create is crafted with care — for the woman who
          values comfort, beauty, and her own story.
        </p>

        <button
          type="button"
          className="btn-story"
          onClick={() => navigate("/about-us")}
        >
          ABOUT US
        </button>
      </div>

      <div className="story-bottom-line" />
    </section>
  );
};

export default OurStory;
