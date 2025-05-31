import { ToolCard } from "@/components/ToolCard";

const tools = [
	{
		id: "todo",
		title: "Todo List",
		description: "管理您的任务，提高工作效率",
		icon: "✅",
		href: "/tools/todo",
		color: "blue" as const,
	},
	{
		id: "calculator",
		title: "计算器",
		description: "基本的数学运算工具",
		icon: "🧮",
		href: "/tools/calculator",
		color: "green" as const,
	},
];

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
			<div className="container mx-auto max-w-6xl px-4 py-8">
				{/* 标题 */}
				<div className="mb-12 text-center">
					<h1 className="mb-4 font-bold text-5xl text-gray-800">🛠️ 工具集合</h1>
					<p className="mx-auto max-w-2xl text-gray-600 text-xl">
						精选的实用工具，让您的工作更高效
					</p>
				</div>

				{/* 工具网格 */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{tools.map((tool) => (
						<ToolCard key={tool.id} tool={tool} />
					))}
				</div>

				{/* 底部信息 */}
				<div className="mt-16 text-center text-gray-500">
					<p className="text-sm">更多工具正在开发中... 敬请期待！</p>
				</div>
			</div>
		</div>
	);
}
