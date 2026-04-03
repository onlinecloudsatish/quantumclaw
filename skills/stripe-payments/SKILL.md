# Stripe Payments

description: Stripe payment integration — checkout, subscriptions, webhooks, and billing

## When to use
- Accepting payments
- Subscription billing
- Payment webhooks

## Key Concepts
- PaymentIntents: Core payment flow
- Checkout: Pre-built payment page
- Subscriptions: Recurring billing
- Webhooks: Payment events

## Common Patterns
\`\`\`typescript
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  line_items: [{ price: priceId, quantity: 1 }],
  mode: "subscription",
});
\`\`\`
