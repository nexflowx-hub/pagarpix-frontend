import type { Metadata } from "next";
import PayoutsClient from "./payouts-client";

export const metadata: Metadata = {
  title: "Saídas manuais",
  robots: { index: false, follow: false, nocache: true }
};

export default function PayoutsPage() {
  return <PayoutsClient />;
}
