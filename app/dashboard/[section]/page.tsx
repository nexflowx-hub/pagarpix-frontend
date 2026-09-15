import { notFound } from "next/navigation";
import DashboardClient, { type DashboardSection } from "../dashboard-client";

const sections = new Set<DashboardSection>(["wallet", "stores", "pix", "movements", "releases"]);

export function generateStaticParams() {
  return Array.from(sections).map((section) => ({ section }));
}

export default async function DashboardSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.has(section as DashboardSection)) notFound();
  return <DashboardClient section={section as DashboardSection} />;
}
