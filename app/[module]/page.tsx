import { notFound } from "next/navigation";
import ManagementApp from "@/components/management-app";
import { getModule } from "@/lib/modules";
export const dynamic = "force-dynamic";
export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (!getModule(module) || module === "employees" || module === "attendance") notFound();
  return <ManagementApp pageKey={module} />;
}
