"use client";

import { useState } from "react";

interface AddTodoProps {
	onAdd: (text: string) => void;
}

export function AddTodo({ onAdd }: AddTodoProps) {
	const [text, setText] = useState("");
	const [isExpanded, setIsExpanded] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (text.trim()) {
			onAdd(text);
			setText("");
			setIsExpanded(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			setText("");
			setIsExpanded(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="relative">
			<div
				className={`rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 ${
					isExpanded ? "border-blue-300 shadow-md" : "hover:shadow-md"
				}`}
			>
				<div className="p-4">
					<div className="flex items-center gap-3">
						<div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-gray-300">
							<svg
								className="h-full w-full text-gray-300"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
									clipRule="evenodd"
								/>
							</svg>
						</div>

						<input
							type="text"
							value={text}
							onChange={(e) => setText(e.target.value)}
							onFocus={() => setIsExpanded(true)}
							onKeyDown={handleKeyDown}
							placeholder="添加新任务..."
							className="flex-1 border-none bg-transparent text-base text-gray-800 placeholder-gray-400 outline-none"
						/>
					</div>

					{isExpanded && (
						<div className="mt-4 flex items-center justify-between">
							<div className="text-gray-500 text-xs">
								按 Enter 添加任务，按 Esc 取消
							</div>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => {
										setText("");
										setIsExpanded(false);
									}}
									className="px-3 py-1.5 text-gray-600 text-sm transition-colors hover:text-gray-800"
								>
									取消
								</button>
								<button
									type="submit"
									disabled={!text.trim()}
									className="rounded-lg bg-blue-600 px-4 py-1.5 font-medium text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									添加任务
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</form>
	);
}
