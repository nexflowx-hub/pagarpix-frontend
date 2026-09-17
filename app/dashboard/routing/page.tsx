import type { Metadata } from "next";
import RoutingClient from "./routing-client";

export const metadata: Metadata = {
  title: "Smart Routing",
  robots: { index: false, follow: false, nocache: true }
};

export default function RoutingPage() {
  return <RoutingClient />;
}
