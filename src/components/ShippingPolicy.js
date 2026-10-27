
import React from "react";
import PolicyPage from "./PolicyPage";

const sections = [
  {
    title: "1. Order Processing Time",
    paragraphs: [
      "Ready-to-Ship products are dispatched within 1–4 business days after payment.",
      "Made-to-Order products are dispatched within 12–20 business days after payment.",
      "During festivals, sales, or new collection launches, processing may take longer.",
      "Business days are Monday to Saturday, excluding public holidays.",
    ],
  },
  {
    title: "2. Delivery Time After Dispatch",
    paragraphs: [
      "Within Tamil Nadu: 3–7 business days.",
      "Rest of India: 4–10 business days.",
      "These are estimated delivery timelines. Delays may occur due to courier issues, strikes, weather conditions, or other unforeseen circumstances.",
    ],
  },
  {
    title: "3. Shipping Charges",
    paragraphs: [
      "Within India: A flat shipping charge of ₹99 per order.",
    ],
  },
  {
    title: "4. Order Tracking",
    paragraphs: [
      "Once your order is shipped, the tracking number will be shared through Email, SMS, or WhatsApp.",
      "You can track your shipment through the courier partner's website or your NAYRA FASHIONS account, where available.",
    ],
  },
  {
    title: "5. Correct Address Is Important",
    paragraphs: [
      "Please provide your complete and correct delivery address, PIN code, and contact number while placing your order.",
      "NAYRA FASHIONS is not responsible for delays or lost parcels caused by incorrect or incomplete delivery information provided by the customer.",
    ],
  },
  {
    title: "6. Delivery Attempts",
    paragraphs: [
      "The courier partner usually attempts delivery twice.",
      "If delivery fails, the parcel may be returned to us. Reshipping the order may involve additional shipping charges.",
    ],
  },
  {
    title: "7. Delays and Exceptions",
    paragraphs: [
      "NAYRA FASHIONS is not responsible for delays caused by courier services, natural calamities, or events beyond our control.",
      "If your order is significantly delayed, please contact us for assistance.",
    ],
  },
  {
    title: "8. Additional Information",
    bullets: [
      "Same-day delivery is not available.",
      "Orders placed on Sundays or public holidays are processed on the next business day.",
      "International orders currently not available.",
    ],
  },
  {
    title: "9. Contact Us",
    paragraphs: [
      "For shipping-related questions or assistance, please contact us using the details below.",
    ],
    contact: [
      "NAYRA FASHIONS",
      "Address: Shop No. 4, 3rd Floor, BBC Plaza (Near Sony Center), North Usman Road, T. Nagar, Chennai, Tamil Nadu – 600017",
      "Phone: 9677328864 / 9840345600",
      "Email: nayrafashions43@gmail.com",
    ],
  },
];

const ShippingPolicy = () => {
  return (
    <PolicyPage
      title="Shipping Policy"
      intro="At NAYRA FASHIONS, we pack every order with care and try to deliver it to you quickly and safely."
      sections={sections}
    />
  );
};

export default ShippingPolicy;
