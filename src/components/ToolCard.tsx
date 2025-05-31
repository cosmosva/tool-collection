import Link from "next/link";

interface Tool {
	id: string;
	title: string;
	description: string;
	icon: string;
	href: string;
	color: "blue" | "green" | "purple" | "red" | "yellow" | "indigo";
}

interface ToolCardProps {
	tool: Tool;
}

const colorMap = {
	blue: {
		bg: "from-blue-50 to-blue-100",
		border: "border-blue-200",
		hover: "hover:border-blue-300 hover:shadow-blue-100",
		text: "text-blue-600",
	},
	green: {
		bg: "from-green-50 to-green-100",
		border: "border-green-200",
		hover: "hover:border-green-300 hover:shadow-green-100",
		text: "text-green-600",
	},
	purple: {
		bg: "from-purple-50 to-purple-100",
		border: "border-purple-200",
		hover: "hover:border-purple-300 hover:shadow-purple-100",
		text: "text-purple-600",
	},
	red: {
		bg: "from-red-50 to-red-100",
		border: "border-red-200",
		hover: "hover:border-red-300 hover:shadow-red-100",
		text: "text-red-600",
	},
	yellow: {
		bg: "from-yellow-50 to-yellow-100",
		border: "border-yellow-200",
		hover: "hover:border-yellow-300 hover:shadow-yellow-100",
		text: "text-yellow-600",
	},
	indigo: {
		bg: "from-indigo-50 to-indigo-100",
		border: "border-indigo-200",
		hover: "hover:border-indigo-300 hover:shadow-indigo-100",
		text: "text-indigo-600",
	},
};

export function ToolCard({ tool }: ToolCardProps) {
	const colors = colorMap[tool.color];

	return (
		<Link href={tool.href}>
			<div
				className={`group bg-gradient-to-br ${colors.bg}rounded-xl border-2 ${colors.border}p-6 cursor-pointer transition-all duration-300 ${colors.hover}hover:shadow-lg hover:-translate-y-1 hover:scale-105 `}
			>
				<div className="text-center">
					{/* 图标 */}
					<div className="mb-4 transform text-4xl transition-transform duration-300 group-hover:scale-110">
						{tool.icon}
					</div>

					{/* 标题 */}
					<h3 className={`font-bold text-xl ${colors.text} mb-2`}>
						{tool.title}
					</h3>

					{/* 描述 */}
					<p className="text-gray-600 text-sm leading-relaxed">
						{tool.description}
					</p>

					{/* 进入指示器 */}
					<div
						className={`mt-4 inline-flex items-center text-sm ${colors.text} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
					>
						<span>进入工具</span>
						<svg
							className="ml-1 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fillRule="evenodd"
								d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				</div>
			</div>
		</Link>
	);
}
