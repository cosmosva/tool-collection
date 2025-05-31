"use client";

import type { Todo } from "@/types/todo";
import { useState } from "react";

interface TodoItemProps {
	todo: Todo;
	onToggle: (id: string) => void;
	onDelete: (id: string) => void;
	onEdit: (id: string, text: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState(todo.text);

	const handleEdit = () => {
		if (editText.trim() && editText !== todo.text) {
			onEdit(todo.id, editText);
		}
		setIsEditing(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleEdit();
		} else if (e.key === "Escape") {
			setEditText(todo.text);
			setIsEditing(false);
		}
	};

	const handleDoubleClick = () => {
		if (!todo.completed) {
			setIsEditing(true);
		}
	};

	return (
		<div
			className={`group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
				todo.completed ? "opacity-75" : ""
			}`}
		>
			<div className="flex items-center gap-3">
				{/* 完成状态复选框 */}
				<button
					onClick={() => onToggle(todo.id)}
					className={`h-5 w-5 flex-shrink-0 rounded-full border-2 transition-all duration-200 ${
						todo.completed
							? "border-green-500 bg-green-500"
							: "border-gray-300 hover:border-green-400"
					}`}
				>
					{todo.completed && (
						<svg
							className="h-full w-full text-white"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fillRule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clipRule="evenodd"
							/>
						</svg>
					)}
				</button>

				{/* 任务文本 */}
				<div className="min-w-0 flex-1">
					{isEditing ? (
						<input
							type="text"
							value={editText}
							onChange={(e) => setEditText(e.target.value)}
							onBlur={handleEdit}
							onKeyDown={handleKeyDown}
							className="w-full rounded border border-gray-300 bg-gray-50 px-2 py-1 text-gray-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
							autoFocus
						/>
					) : (
						<div
							onDoubleClick={handleDoubleClick}
							className={`-m-2 cursor-pointer rounded p-2 transition-colors ${
								todo.completed
									? "text-gray-500 line-through"
									: "text-gray-800 hover:bg-gray-50"
							}`}
						>
							{todo.text}
						</div>
					)}
				</div>

				{/* 操作按钮 */}
				<div className="flex flex-shrink-0 items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
					{!isEditing && !todo.completed && (
						<button
							onClick={() => setIsEditing(true)}
							className="rounded p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
							title="编辑"
						>
							<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
								<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
							</svg>
						</button>
					)}

					<button
						onClick={() => onDelete(todo.id)}
						className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
						title="删除"
					>
						<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 012 0v6a1 1 0 11-2 0V9zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V9z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* 时间信息 */}
			<div className="mt-2 text-gray-400 text-xs">
				创建于 {todo.createdAt.toLocaleString("zh-CN")}
				{todo.updatedAt.getTime() !== todo.createdAt.getTime() && (
					<span className="ml-2">
						更新于 {todo.updatedAt.toLocaleString("zh-CN")}
					</span>
				)}
			</div>
		</div>
	);
}
