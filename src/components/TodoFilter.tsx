"use client";

import type { TodoStatus } from "@/types/todo";

interface TodoFilterProps {
	filter: TodoStatus;
	onFilterChange: (filter: TodoStatus) => void;
	activeCount: number;
	completedCount: number;
	onClearCompleted: () => void;
}

export function TodoFilter({
	filter,
	onFilterChange,
	activeCount,
	completedCount,
	onClearCompleted,
}: TodoFilterProps) {
	const filters: { key: TodoStatus; label: string; count?: number }[] = [
		{ key: "all", label: "全部" },
		{ key: "active", label: "待完成", count: activeCount },
		{ key: "completed", label: "已完成", count: completedCount },
	];

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
			<div className="flex items-center justify-between">
				<div className="flex gap-1">
					{filters.map(({ key, label, count }) => (
						<button
							key={key}
							onClick={() => onFilterChange(key)}
							className={`rounded-lg px-3 py-2 font-medium text-sm transition-colors ${
								filter === key
									? "bg-blue-100 text-blue-700"
									: "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
							}`}
						>
							{label}
							{count !== undefined && (
								<span className="ml-1.5 rounded-full bg-gray-200 px-1.5 py-0.5 text-gray-600 text-xs">
									{count}
								</span>
							)}
						</button>
					))}
				</div>

				{completedCount > 0 && (
					<button
						onClick={onClearCompleted}
						className="rounded-lg px-3 py-2 text-red-600 text-sm transition-colors hover:bg-red-50 hover:text-red-700"
					>
						清除已完成
					</button>
				)}
			</div>
		</div>
	);
}
