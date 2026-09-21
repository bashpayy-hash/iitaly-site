# Stripe production activation

Account: IItaly. Server: Railway `thorough-intuition` / production / `web`.
Only merge the production flag after the following operational setup succeeds.

1. Store a live restricted Stripe API key with Checkout Sessions write access
   in Railway variable `STRIPE_SECRET_KEY`. Never commit it or put it in a
   `NEXT_PUBLIC_` variable. The backend uses this key only to create Sessions.
2. Create an account webhook for
   `https://web-production-9faf3.up.railway.app/api/stripe/webhook`, with:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.expired`. Store its signing secret in Railway variable
   `STRIPE_WEBHOOK_SECRET`.
3. Confirm `SITE_URL=https://iitaly.netlify.app`, deploy the Railway variables,
   and confirm `/health` reports `stripeConfigured: true` and healthy storage.
4. Merge this change. Netlify production builds with
   `NEXT_PUBLIC_STRIPE_ENABLED=true`; deploy previews retain the default off
   state. The isolated CI checkout suite explicitly builds with Stripe on.
5. Verify a hosted Checkout session at the real server-fixed price of 25,000
   KZT (or 16,900 KZT for expert review), its success/cancel URLs, and signed
   payment confirmation. Opening a live checkout is not a payment test; do not
   claim a successful charge until Stripe confirms an actual paid transaction.

The server checks signature, order/session identity, currency and total before
idempotent fulfillment. Redirecting to `/payment/success` alone never grants
access. The return page now keeps pending status neutral until confirmed.

Rollback: set the Netlify production flag to `false` and rebuild. Manual order
support remains in the application.

References: https://docs.stripe.com/payments/accept-a-payment?payment-ui=checkout&ui=stripe-hosted
and https://docs.stripe.com/keys/restricted-api-keys.
