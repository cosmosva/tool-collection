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
	{
		id: "markdown",
		title: "Markdown 工具",
		description: "Markdown文档预览与格式转换",
		icon: "📝",
		href: "/tools/markdown",
		color: "purple" as const,
	},
	{
		id: "audio",
		title: "音频处理",
		description: "音频合并、视频音频提取、格式转换",
		icon: "🎵",
		href: "/tools/audio",
		color: "yellow" as const,
	},
];

export default function HomePage() {
	return (
		<div className="min-h-screen overflow-hidden">
			{/* 动态背景 */}
			<div className="fixed inset-0 -z-10">
				<div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100" />
				<div className="absolute left-0 top-0 h-96 w-96 animate-blob rounded-full bg-purple-300 opacity-20 blur-3xl" />
				<div className="animation-delay-2000 absolute right-0 top-0 h-96 w-96 animate-blob rounded-full bg-yellow-300 opacity-20 blur-3xl" />
				<div className="animation-delay-4000 absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 animate-blob rounded-full bg-pink-300 opacity-20 blur-3xl" />
			</div>

			<div className="relative">
				{/* 顶部装饰 */}
				<div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
				
				<div className="container mx-auto max-w-7xl px-4 py-20">
					{/* 标题区域 */}
					<div className="mb-16 text-center">
						<div className="mb-6 inline-flex items-center rounded-full bg-purple-100 px-4 py-2 text-purple-700 text-sm">
							<span className="mr-2">✨</span>
							<span className="font-medium">简单高效的在线工具集</span>
						</div>
						
						<h1 className="mb-6 font-bold text-6xl text-gray-900 md:text-7xl">
							<span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
								工具集合
							</span>
						</h1>
						
						<p className="mx-auto max-w-3xl text-gray-600 text-xl leading-relaxed md:text-2xl">
							精心打造的实用工具，助您<span className="font-semibold text-purple-600">事半功倍</span>
						</p>

						{/* 统计信息 */}
						<div className="mt-10 flex flex-wrap justify-center gap-8">
							<div className="text-center">
								<div className="font-bold text-3xl text-purple-600">{tools.length}</div>
								<div className="text-gray-500 text-sm">可用工具</div>
							</div>
							<div className="text-center">
								<div className="font-bold text-3xl text-green-600">100%</div>
								<div className="text-gray-500 text-sm">免费使用</div>
							</div>
							<div className="text-center">
								<div className="font-bold text-3xl text-blue-600">∞</div>
								<div className="text-gray-500 text-sm">持续更新</div>
							</div>
						</div>
					</div>

					{/* 工具网格 */}
					<div className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
						{tools.map((tool, index) => (
							<div
								key={tool.id}
								className="animate-fadeInUp"
								style={{ animationDelay: `${index * 100}ms` }}
							>
								<ToolCard tool={tool} />
							</div>
						))}
					</div>

					{/* 特性展示 */}
					<div className="mb-20 rounded-3xl bg-white/80 p-12 shadow-2xl backdrop-blur-sm">
						<h2 className="mb-10 text-center font-bold text-3xl text-gray-800">
							为什么选择我们的工具？
						</h2>
						<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-2xl">
									🚀
								</div>
								<h3 className="mb-2 font-semibold text-lg">快速高效</h3>
								<p className="text-gray-600 text-sm">
									所有工具都经过优化，确保快速响应和流畅体验
								</p>
							</div>
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl">
									🔒
								</div>
								<h3 className="mb-2 font-semibold text-lg">安全可靠</h3>
								<p className="text-gray-600 text-sm">
									所有处理都在本地完成，数据不会上传到服务器
								</p>
							</div>
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl">
									💡
								</div>
								<h3 className="mb-2 font-semibold text-lg">简单易用</h3>
								<p className="text-gray-600 text-sm">
									直观的界面设计，无需学习即可上手使用
								</p>
							</div>
						</div>
					</div>

					{/* 底部信息 */}
					<div className="text-center">
						<div className="mb-8">
							<p className="mb-4 text-gray-600 text-lg">
								还有更多实用工具正在开发中
							</p>
							<div className="flex justify-center gap-3">
								<span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-gray-700 text-sm">
									🎨 图片编辑器
								</span>
								<span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-gray-700 text-sm">
									🔐 密码生成器
								</span>
								<span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-gray-700 text-sm">
									📊 数据分析
								</span>
							</div>
						</div>
						
						<p className="text-gray-400 text-sm">
							Made with ❤️ using Next.js & Tailwind CSS
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
