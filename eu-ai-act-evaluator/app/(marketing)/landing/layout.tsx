import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EU AI Act Evaluator - Navigate AI Compliance with Confidence",
  description: "Transform complex EU AI Act obligations into actionable compliance roadmaps. Built for AI teams, legal counsel, and compliance officers.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
