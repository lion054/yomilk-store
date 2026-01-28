import { Component } from '@angular/core';
import {of} from "rxjs";

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent {

  // faqList:any = [
  //   {
  //     "question": "How do I place an order?",
  //     "answer": "To place an order, simply:\n\n- Open the app, login if you are already registered, otherwise register and browse through our product categories.\n- Select the items you’d like to order.\n- Add them to your cart and proceed to checkout.\n- Choose your payment method.\n- Confirm your delivery address and place your order.\n\nYou will receive an instant order confirmation."
  //   },
  //   {
  //     "question": "What payment methods do you accept?",
  //     "answer": "We accept a variety of payment methods, including:\n\n- Innbucks\n- Ecocash\n- Paynow (Zimswitch)\n- COD (order will only be dropped on full payment)\n- Credit/Debit Cards (Visa, MasterCard)"
  //   },
  //   {
  //     "question": "How do I track my order?",
  //     "answer": "Once your order is confirmed, you can track its progress directly in the app. Just visit the 'Orders' section and select the specific order to see its status (e.g., processing, shipped, delivered)."
  //   },
  //   {
  //     "question": "Can I cancel or modify my order after placing it?",
  //     "answer": "Orders can only be modified or cancelled if they haven’t been processed yet. To request a cancellation or modification, please contact our support team through the app at 0782 978 460 or via email on support@snappyfresh.net as soon as possible"
  //   },
  //   {
  //     "question": "What should I do if I’m having trouble with the app?",
  //     "answer": "If you’re facing issues with the app, try the following:\n\n- Ensure your app is updated to the latest version.\n- Restart the app or your device.\n- Clear your app cache if you’re experiencing slow performance.\n\nIf the issue persists, reach out to our customer support team, and we’ll be happy to assist you!"
  //   },
  //   {
  //     "question": "How do I contact customer support?",
  //     "answer": "You can contact our customer support team by:\n\n- Using the 'Help & Support' section in the app.\n- Emailing us directly at support@snappyfresh.com.\n- Calling our support hotline at 0782 978 460."
  //   },
  //   {
  //     "question": "Are there any delivery fees?",
  //     "answer": "Delivery fees vary based on your location. You can view the exact delivery fee during the checkout process before confirming your order."
  //   },
  //   {
  //     "question": "How do I update my delivery address?",
  //     "answer": "You can update your delivery address in your account settings or during the checkout process. Ensure your address is correct before confirming your order to avoid delays."
  //   },
  //   {
  //     "question": "Is my personal and payment information secure?",
  //     "answer": "Yes, we prioritize your privacy and security. All payment transactions are encrypted, and we use the latest security protocols to protect your personal information."
  //   },
  //   {
  //     "question": "Do you offer refunds or exchanges?",
  //     "answer": "We offer refunds or exchanges in certain situations, such as:\n\n- If the wrong item was delivered.\n- If the item is damaged.\n- If the order didn’t meet your expectations (conditions apply).\n\nPlease contact our support team for assistance with returns or refunds."
  //   },
  //   {
  //     "question": "Do you offer promotions or discounts?",
  //     "answer": "Yes! Be sure to sign up for our newsletter or check our promotions page regularly to get the latest deals, discounts, and special offers."
  //   },
  //   {
  //     "question": "Can I order in bulk or for events?",
  //     "answer": "Yes, we offer bulk ordering for events. If you need to place a large order, please contact our customer support team, and we’ll provide you with the best options and discounts."
  //   },
  //   {
  //     "question": "How can I create an account?",
  //     "answer": "To create an account, click on the 'Sign Up' button in the app, enter your email address and contact number, create a password."
  //   }
  // ]


  faqList:any = [
    {
      "question": "How do I place an order?",
      "answer": "Easy-peasy! 🛒 Just open the app or website, log in (or sign up), add your items to the cart, choose a payment method, confirm your delivery address, and hit Place Order!"
    },
    {
      "question": "What payment methods do you accept?",
      "answer": "We accept:\n\n- Innbucks\n- EcoCash\n- Debit/Credit Cards\n- Zimswitch (Paynow)\n- Cash on Delivery (COD – No change? No problem. We'll credit your SnappyFresh Wallet for your next purchase!)"
    },
    {
      "question": "How do I track my order?",
      "answer": "Head to the Orders section in the app to see your order status — from packed to delivered! 🚚"
    },
    {
      "question": "Can I cancel or change my order?",
      "answer": "Only if we haven’t processed it yet! ⏱ Call or message us ASAP on +263 782 978 460 / +263 784 105 732 or email support@snappyfresh.net"
    },
    {
      "question": "Are there any delivery fees?",
      "answer": "Yes, a small fee applies depending on your location 🚲 — you’ll see it clearly at checkout."
    },
    {
      "question": "How do I contact customer support?",
      "answer": "We’re always here to help! 📞\n\n- In the app (Help & Support)\n- Call/WhatsApp: +263 782 978 460\n- Call/WhatsApp: +263 784 105 732\n- Email: support@snappyfresh.net"
    },
    {
      "question": "Is my info safe?",
      "answer": "Totally secure 🔒 — we use top-level encryption and never share your data."
    },
    {
      "question": "Do you offer refunds or exchanges?",
      "answer": "Yes! If something’s wrong (like a damaged or wrong item), let us know and we’ll fix it 💯. Conditions apply."
    },
    {
      "question": "I’m having trouble with the app — what now?",
      "answer": "Try updating or restarting the app. Still stuck? Contact us — we’ll sort it out fast! 🔧"
    },
    {
      "question": "How do I update my delivery address?",
      "answer": "Go to your account settings or change it at checkout before confirming your order. 📍"
    },
    {
      "question": "Do you offer deals or promos?",
      "answer": "Yes, we love giving you deals! 🎉\n\nFollow us on our social media pages or sign up for our newsletter to stay in the loop.\n\n- Instagram: https://www.instagram.com/snappyfreshzw/?hl=en\n- Facebook: https://www.facebook.com/SnappyFresh.net"
    },
    {
      "question": "Can I order in bulk or for events?",
      "answer": "Absolutely! 🎊 Contact us for big orders and we’ll help you with discounts and delivery options."
    },
    {
      "question": "How do I create an account?",
      "answer": "Just hit Sign Up on the website, enter your info, create a password — done in 60 seconds! 🧾"
    }
  ]

}
