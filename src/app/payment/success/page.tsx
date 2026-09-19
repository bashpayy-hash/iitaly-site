import type { Metadata } from "next";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PaymentSuccess } from "@/components/payment/PaymentSuccess";

export const metadata: Metadata = {
  title: "Оплата",
  robots: { index: false, follow: false, nocache: true },
};

export default function PaymentSuccessPage() {
  return (
    <MarketingLayout>
      <PaymentSuccess />
    </MarketingLayout>
  );
}
