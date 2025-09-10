import Stripe from "stripe"

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!)

export default stripe