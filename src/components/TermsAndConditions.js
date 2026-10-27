
import React from "react";
import PolicyPage from "./PolicyPage";

const sections = [
  {
    title: "1. About NAYRA FASHIONS",
    paragraphs: [
      "NAYRA FASHIONS offers fashion products for customers who value style, comfort, quality, and affordability.",
      "In these Terms and Conditions, the words “we,” “our,” and “us” refer to NAYRA FASHIONS. The words “you” and “your” refer to anyone visiting our website or purchasing our products.",
    ],
  },
  {
    title: "2. Eligibility and Customer Information",
    paragraphs: [
      "You must be at least 18 years old to place an order independently. Customers below 18 years of age may use our website and make purchases with the involvement and supervision of a parent or legal guardian.",
      "When placing an order, you must provide correct and complete information, including your name, contact number, email address, delivery address, and payment details, wherever required.",
      "Please ensure that your contact and delivery details are accurate to avoid delivery problems.",
    ],
  },
  {
    title: "3. Products, Images, and Descriptions",
    paragraphs: [
      "We make every effort to display our products, images, colours, sizes, fabrics, and descriptions as accurately as possible.",
      "However, slight differences in colour or appearance may occur due to lighting, photography, or your device's screen settings.",
      "Please check the product description, available sizes, fabric details, and other information carefully before placing your order.",
      "If you have any questions about a product, please contact us before purchasing.",
    ],
  },
  {
    title: "4. Prices and Payments",
    paragraphs: [
      "All product prices will be displayed on our website. Applicable shipping charges, taxes, and other additional charges, if any, will be shown before you complete your purchase.",
      "Prices, offers, and product availability may change from time to time. Any price change will not affect an order that has already been confirmed, except where correction is legally permitted or required.",
      "Payments must be made through the payment methods available on our website.",
      "An order will be processed after successful payment and order confirmation, unless a different payment arrangement is expressly offered by us.",
    ],
  },
  {
    title: "5. Order Confirmation, Cancellation, and Changes",
    paragraphs: [
      "After placing an order, you should receive an order confirmation through the contact details you provided.",
      "We reserve the right to cancel or refuse an order in circumstances such as product unavailability, an obvious pricing or listing error, suspected fraudulent activity, or other valid reasons permitted by law.",
      "If we cancel an order after receiving payment, we will arrange a refund of the amount paid, as applicable, in accordance with the law.",
      "If you wish to change or cancel an order, please contact us as soon as possible. Changes or cancellations may not be possible once the order has been processed, packed, or dispatched.",
      "Any cancellation charges or restrictions will be communicated where applicable and will be subject to applicable law.",
    ],
  },
  {
    title: "6. Shipping and Delivery",
    paragraphs: [
      "We aim to deliver your order within the estimated delivery period displayed or communicated to you.",
      "Delivery times may vary depending on your location, courier availability, weather conditions, public holidays, or other circumstances beyond our reasonable control.",
      "Please provide a complete and accurate delivery address and contact number.",
      "If delivery is delayed, we will make reasonable efforts to assist you and provide updates where possible.",
      "If your package arrives damaged, appears to have been tampered with, or contains the wrong product, please contact us promptly and provide photographs/ videos and your order details to help us review the issue.",
    ],
  },
  {
    title: "7. Return, Exchange, Replacement, and Refund Policy",
    paragraphs: [
      "NAYRA FASHIONS generally follows a No Return and No Refund Policy for products purchased by choice, including cases where a customer changes their mind or selects an unsuitable style or size.",
      "However, if you receive a defective, damaged, or incorrect product, please contact us within the return or complaint period stated in our separate Return Policy.",
      "Such cases will be reviewed, and an eligible order may qualify for a replacement, exchange, or refund, depending on the circumstances and applicable law.",
      "To help us resolve the issue, please provide your order number, a description of the problem, and clear photographs or videos where appropriate.",
      "Please refer to our separate Return and Refund Policy for the applicable time limits, process, and conditions.",
      "Nothing in this policy is intended to exclude or limit any rights or remedies that cannot legally be excluded under applicable Indian law.",
    ],
  },
  {
    title: "8. Offers, Discounts, and Promotions",
    paragraphs: [
      "From time to time, NAYRA FASHIONS may offer discounts, promotional deals, gifts, or special offers.",
      "Each offer may have its own conditions, validity period, product restrictions, or minimum purchase requirements. These details will be communicated with the relevant offer.",
      "Offers cannot be combined unless expressly stated. We reserve the right to modify or withdraw an offer where permitted by law.",
    ],
  },
  {
    title: "9. Privacy and Personal Information",
    paragraphs: [
      "We respect your privacy and handle your personal information in accordance with our Privacy Policy and applicable Indian law.",
      "Your information may be used, as necessary, to process orders, arrange deliveries, handle payments, provide customer support, and communicate important order updates.",
      "Please read our Privacy Policy to understand how your information is collected, used, stored, and protected.",
    ],
  },
  {
    title: "10. Intellectual Property",
    paragraphs: [
      "All content on the NAYRA FASHIONS website, including our brand name, logo, product photographs, designs, text, graphics, and other materials, is owned by us or used with appropriate permission.",
      "You may not copy, reproduce, distribute, modify, or use this content for commercial purposes without our prior written permission, except where permitted by law.",
    ],
  },
  {
    title: "11. Acceptable Use of the Website",
    paragraphs: [
      "You agree to use our website only for lawful purposes.",
      "You must not use the website for any illegal or fraudulent activity.",
    ],
  },
  {
    title: "12. Website Availability and Errors",
    paragraphs: [
      "We make reasonable efforts to keep our website available, accurate, and up to date.",
      "However, temporary interruptions, technical problems, typographical errors, or incorrect product information may occasionally occur.",
      "We reserve the right to correct errors, update information, or make changes to our website. Where an error affects an order, we will address it in accordance with applicable law and communicate with the customer where appropriate.",
    ],
  },
  {
    title: "13. Limitation of Liability",
    paragraphs: [
      "To the extent permitted by applicable law, NAYRA FASHIONS will not be responsible for indirect or consequential losses arising from the use of our website or products.",
      "We do not guarantee that the website will always be available, uninterrupted, or completely free from technical errors.",
      "Nothing in these terms excludes or limits liability where such exclusion or limitation is prohibited by law, including any applicable consumer rights.",
    ],
  },
  {
    title: "14. Changes to These Terms",
    paragraphs: [
      "We may update these Terms and Conditions from time to time to reflect changes in our business, website, policies, or applicable law.",
      "The updated version will be published on this page with the revised effective date, where appropriate.",
      "We encourage you to review this page periodically to stay informed about the terms that apply to your use of our website.",
    ],
  },
  {
    title: "15. Governing Law and Jurisdiction",
    paragraphs: [
      "These Terms and Conditions are governed by the laws of India.",
      "Subject to applicable law and the jurisdiction of any competent consumer forum or other authority, disputes arising from these terms will be subject to the jurisdiction of the competent courts in Chennai, Tamil Nadu.",
    ],
  },
  {
    title: "16. Contact Us",
    paragraphs: [
      "If you have any questions about these Terms and Conditions, your order, or our policies, please contact NAYRA FASHIONS using the contact details provided on our website.",
    ],
    contact: [
      "NAYRA FASHIONS",
      "Website: www.nayrafashions.com",
      "Phone/Whatsapp: 9677328864 / 9840345600",
      "Instagram: @nayrafashions10",
    ],
    paragraphsAfter: [
      "Thank you for choosing NAYRA FASHIONS. We appreciate your trust and look forward to serving you with style, comfort, and quality.",
    ],
  },
];

const TermsAndConditions = () => (
  <PolicyPage
    title="Terms and Conditions"
    intro="Welcome to NAYRA FASHIONS! These Terms and Conditions explain the rules for using our website and purchasing products from us. By visiting our website or placing an order, you agree to these terms. Please read them carefully before making a purchase."
    sections={sections.map((section) => ({
      ...section,
      paragraphs: [
        ...(section.paragraphs || []),
        ...(section.paragraphsAfter || []),
      ],
    }))}
  />
);

export default TermsAndConditions;
