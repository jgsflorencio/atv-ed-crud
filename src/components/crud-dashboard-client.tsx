"use client";

import dynamic from "next/dynamic";

const CrudDashboard = dynamic(
  () => import("@/components/crud-dashboard").then((module) => module.CrudDashboard),
  { ssr: false },
);

export function CrudDashboardClient() {
  return <CrudDashboard />;
}
