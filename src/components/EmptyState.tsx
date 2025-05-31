"use client";

import type { TodoStatus } from "@/types/todo";

interface EmptyStateProps {
	filter: TodoStatus;
	hasAnyTodos: boolean;
}

export function EmptyState({ filter, hasAnyTodos }: EmptyStateProps) {
	const getEmptyMessage = () => {
		if (!hasAnyTodos) {
			return {
				icon: "📝",
				title: "还没有任务",
				subtitle: "添加您的第一个任务开始管理您的待办事项",
			};
		}

		switch (filter) {
			case "active":
				return {
					icon: "🎉",
					title: "所有任务都已完成！",
					subtitle: "您很棒！没有待完成的任务了",
				};
			case "completed":
				return {
					icon: "⏰",
					title: "还没有完成的任务",
					subtitle: "完成一些任务后它们会在这里显示",
				};
			default:
				return {
					icon: "🤔",
					title: "没有找到任务",
					subtitle: "尝试调整过滤条件或添加新任务",
				};
		}
	};

	const { icon, title, subtitle } = getEmptyMessage();

	return (
		<div className="py-12 text-center">
			<div className="mb-4 text-6xl">{icon}</div>
			<h3 className="mb-2 font-medium text-gray-900 text-lg">{title}</h3>
			<p className="mx-auto max-w-sm text-gray-500">{subtitle}</p>
		</div>
	);
}
