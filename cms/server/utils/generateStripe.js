// server/utils/generateStripe.js
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createStripeLink(name, price) {
  const product = await stripe.products.create({ name });
  const priceObj = await stripe.prices.create({
    product: product.id,
    unit_amount: price * 100,
    currency: "usd",
  });
  const link = await stripe.paymentLinks.create({
    line_items: [{ price: priceObj.id, quantity: 1 }],
  });
  return link.url;
}
