import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "工具集合",
	description: "实用的在线工具集合",
};

export default function ToolsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
