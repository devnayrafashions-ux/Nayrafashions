
import React from "react";
import { Link } from "react-router-dom";
import "./PolicyPage.css";

const PolicyPage = ({ title, intro, sections }) => {
  return (
    <main className="policy-page">
      <div className="policy-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>{title}</span>
      </div>

      <header className="policy-header">
        <span className="policy-brand">NAYRA FASHIONS</span>
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </header>

      <article className="policy-content">
        {sections.map((section, index) => (
          <section className="policy-section" key={`${section.title}-${index}`}>
            <h2>{section.title}</h2>

            {section.paragraphs?.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}

            {section.bullets && (
              <ul>
                {section.bullets.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}

            {section.emphasis && (
              <p className="policy-emphasis">{section.emphasis}</p>
            )}

            {section.contact && (
              <div className="policy-contact">
                {section.contact.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </section>
        ))}
      </article>

      <div className="policy-back">
        <Link to="/">← Back to Home</Link>
      </div>
    </main>
  );
};

export default PolicyPage;
