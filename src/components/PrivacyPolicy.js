
import React from "react";
import PolicyPage from "./PolicyPage";

const sections = [
  {
    title: "1. What Information We Collect",
    paragraphs: ["When you shop with us, we may collect:"],
    bullets: [
      "Your name, mobile number, and email address",
      "Your billing and delivery address, PIN code, city and state",
      "Your order history and purchase details",
      "Payment information needed to process your order",
      "Information you share when you contact our customer support",
      "Device information like browser type, IP address, and how you use our website",
      "Cookies that help our website work better",
    ],
    emphasis:
      "We collect only the information that we need to run our store and serve you better.",
  },
  {
    title: "2. How We Use Your Information",
    paragraphs: ["We use your information to:"],
    bullets: [
      "Process, confirm, and deliver your orders",
      "Send you order updates and delivery notifications",
      "Manage returns, exchanges, and refunds",
      "Create and manage your account",
      "Answer your questions and solve your problems",
      "Improve our website and products",
      "Prevent fraud and keep our website safe",
      "Send you offers and new collection updates (only if you have allowed us)",
    ],
    paragraphsAfter: [
      "You can stop receiving promotional messages from us at any time.",
    ],
  },
  {
    title: "3. Cookies",
    paragraphs: [
      "We use cookies to make our website work properly, remember your choices, and understand how visitors use our site. You can turn off cookies in your browser settings, but some parts of our website may not work correctly if you do.",
    ],
  },
  {
    title: "4. Payment Information",
    paragraphs: [
      "Your payments are processed through secure third-party payment gateways. NAYRA FASHIONS does not store your full card number, CVV, UPI PIN, or banking passwords on our servers.",
    ],
  },
  {
    title: "5. Who We Share Your Information With",
    paragraphs: [
      "We do not sell your personal information. We only share necessary information with trusted partners who help us run our business, such as:",
    ],
    bullets: [
      "Delivery and courier partners",
      "Payment gateway partners",
      "Website hosting and technology support",
      "Customer support services",
    ],
    paragraphsAfter: [
      "We may also share information with government authorities if required by law.",
    ],
  },
  {
    title: "6. Marketing Communications",
    paragraphs: [
      "We may send you updates about new arrivals, offers, and sales via Email, SMS, or WhatsApp if you have given us permission. You can unsubscribe at any time by clicking the unsubscribe link or by contacting us.",
    ],
  },
  {
    title: "7. How We Protect Your Data",
    paragraphs: [
      "We use reasonable security measures to protect your information from unauthorized access, loss, or misuse. However, no method on the internet is 100% secure.",
    ],
  },
  {
    title: "8. How Long We Keep Your Data",
    paragraphs: [
      "We keep your information only as long as we need it to complete your orders, provide customer service, and meet our legal and accounting requirements. After that, we will securely delete it.",
    ],
  },
  {
    title: "9. Your Rights",
    paragraphs: ["You have the right to:"],
    bullets: [
      "Know what personal data we have about you",
      "Ask us to correct your information if it is wrong",
      "Ask us to delete your information where legally possible",
      "Withdraw your consent",
      "Stop receiving promotional messages",
    ],
    paragraphsAfter: [
      "To exercise these rights, please contact us using the details below.",
    ],
  },
  {
    title: "10. Links to Other Websites",
    paragraphs: [
      "Our website may have links to other websites like payment gateways or social media platforms. We are not responsible for their privacy practices. Please check their privacy policies.",
    ],
  },
  {
    title: "11. Changes to This Policy",
    paragraphs: [
      "We may update this policy from time to time. The latest version will always be available on this page with the updated date.",
    ],
  },
  {
    title: "12. Contact Us",
    paragraphs: [
      "If you have any questions or concerns about this Privacy Policy, please contact us:",
    ],
    contact: [
      "NAYRA FASHIONS",
      "Address: Shop No.4, 3rd Floor, BBC Plaza (Near Sony Center), North Usman Road, T. Nagar, Chennai, Tamil Nadu - 600017",
      "Email: nayrafashions43@gmail.com",
      "Phone: 9677328864 / 9840345600",
    ],
  },
];

const PrivacyPolicy = () => (
  <PolicyPage
    title="Privacy Policy for NAYRA FASHIONS"
    intro="At NAYRA FASHIONS, your privacy is important to us. This policy explains what information we collect and how we use it when you visit our website, create an account, place an order, or contact us."
    sections={sections.map((section) => ({
      ...section,
      paragraphs: [
        ...(section.paragraphs || []),
        ...(section.paragraphsAfter || []),
      ],
    }))}
  />
);

export default PrivacyPolicy;
