
import React from "react";
import PolicyPage from "./PolicyPage";

const sections = [
  {
    title: "1. When Are You Eligible for a Refund?",
    paragraphs: [
      "We provide refunds only for genuine reasons approved by us, such as:",
    ],
    bullets: [
      "We sent you the wrong product",
      "You received a damaged or defective product",
      "An item is missing from your order",
      "We cancelled your order due to unavailability of stock",
    ],
    paragraphsAfter: [
      'Products marked as "Non-Returnable / Non-Exchangeable" on the product page are not eligible for a refund.',
    ],
  },
  {
    title: "2. How to Request a Refund",
    paragraphs: [
      "If you have an issue with your order, please contact us within 48 hours of delivery.",
      "To request a refund, please share:",
    ],
    bullets: [
      "Your Order Number",
      "Your Name and Registered Mobile Number",
      "Reason for refund",
      "Clear photos and a continuous unboxing video",
    ],
    emphasis:
      "Unboxing Video is Mandatory: For any claim related to damage, wrong product, or missing item, a continuous unboxing video is required. The video should show the unopened parcel, shipping label, and the full opening process. Without this video, we cannot process your claim.",
    paragraphsAfter: [
      "You can contact us on WhatsApp or Email.",
    ],
  },
  {
    title: "3. Cancellation Before Dispatch",
    paragraphs: [
      "You can request cancellation before your order is dispatched. Once the order is shipped, it cannot be cancelled. If your cancellation request is approved, the refund will be initiated.",
    ],
  },
  {
    title: "4. Damaged, Defective, Wrong Product or Missing Item",
    paragraphs: [
      "If you receive a damaged product or the wrong item, please inform us within 48 hours. We will verify the issue with your photos, video, and our packing records. After verification, we will provide a replacement, exchange, or refund based on availability.",
    ],
  },
  {
    title: "5. Pre-Booking and Made-to-Order Products",
    paragraphs: [
      "For pre-booking and made-to-order products, different cancellation and refund rules may apply. Please check the details mentioned on the product page before placing the order.",
    ],
  },
  {
    title: "6. Sale and Discounted Products",
    paragraphs: [
      "For orders placed during a sale or with a discount code, the refund will be based on the actual amount you paid, not the original MRP.",
    ],
  },
  {
    title: "7. When Refund is Not Available",
    paragraphs: ["We cannot provide refunds for:"],
    bullets: [
      "Change of mind after placing the order",
      "Wrong size selected by the customer",
      "Slight colour difference due to screen settings",
      "Minor variation in print, embroidery, or fabric",
      "Damage caused after delivery due to mishandling, washing, or alteration",
      "Products that have been used, washed, or stained",
    ],
  },
  {
    title: "8. Shipping Charges",
    paragraphs: [
      "Shipping charges are non-refundable, except when the mistake is from our side.",
    ],
  },
  {
    title: "9. Failed Delivery",
    paragraphs: [
      "If your order is returned to us due to a wrong address, refusal to accept delivery, or repeated failed delivery attempts, any refund will be processed after deducting return shipping charges.",
    ],
  },
  {
    title: "10. Refund Method and Time",
    bullets: [
      "Once your refund is approved, we will initiate it within 6 to 9 business days.",
      "The amount will be refunded to your original payment method. If that is not possible, we will arrange an alternative method.",
      "The time taken for the amount to reflect in your account depends on your bank or payment gateway.",
    ],
  },
  {
    title: "11. Fraudulent Transactions",
    paragraphs: [
      "We have the right to cancel any order that we find suspicious or fraudulent.",
    ],
  },
  {
    title: "12. Contact Us for Refunds",
    contact: [
      "NAYRA FASHIONS - Customer Care",
      "Address: Shop No.4, 3rd Floor, BBC Plaza (Near Sony Center), North Usman Road, T. Nagar, Chennai - 600017",
      "Phone: 9677328864 / 9840345600",
      "Email: nayrafashions43@gmail.com",
      "Website: http://www.nayrafashions.com",
    ],
  },
];

const RefundPolicy = () => (
  <PolicyPage
    title="Refund Policy - NAYRA FASHIONS"
    intro="At NAYRA FASHIONS, we check and pack every order carefully before dispatch. Please read our Refund Policy before placing your order."
    sections={sections.map((section) => ({
      ...section,
      paragraphs: [
        ...(section.paragraphs || []),
        ...(section.paragraphsAfter || []),
      ],
    }))}
  />
);

export default RefundPolicy;
