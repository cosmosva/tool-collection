"use client";

import type { Todo, TodoStatus } from "@/types/todo";
import { useEffect, useState } from "react";
import { AddTodo } from "./AddTodo";
import { EmptyState } from "./EmptyState";
import { TodoFilter } from "./TodoFilter";
import { TodoItem } from "./TodoItem";

export function TodoApp() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [filter, setFilter] = useState<TodoStatus>("all");

	// 从 localStorage 加载数据
	useEffect(() => {
		const savedTodos = localStorage.getItem("todos");
		if (savedTodos) {
			try {
				const parsedTodos = JSON.parse(savedTodos).map((todo: {
					id: string;
					text: string;
					completed: boolean;
					createdAt: string;
					updatedAt: string;
				}) => ({
					...todo,
					createdAt: new Date(todo.createdAt),
					updatedAt: new Date(todo.updatedAt),
				}));
				setTodos(parsedTodos);
			} catch (error) {
				console.error("Failed to parse todos from localStorage:", error);
			}
		}
	}, []);

	// 保存到 localStorage
	useEffect(() => {
		localStorage.setItem("todos", JSON.stringify(todos));
	}, [todos]);

	const addTodo = (text: string) => {
		const newTodo: Todo = {
			id: crypto.randomUUID(),
			text: text.trim(),
			completed: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		setTodos((prev) => [newTodo, ...prev]);
	};

	const toggleTodo = (id: string) => {
		setTodos((prev) =>
			prev.map((todo) =>
				todo.id === id
					? { ...todo, completed: !todo.completed, updatedAt: new Date() }
					: todo,
			),
		);
	};

	const deleteTodo = (id: string) => {
		setTodos((prev) => prev.filter((todo) => todo.id !== id));
	};

	const editTodo = (id: string, newText: string) => {
		setTodos((prev) =>
			prev.map((todo) =>
				todo.id === id
					? { ...todo, text: newText.trim(), updatedAt: new Date() }
					: todo,
			),
		);
	};

	const clearCompleted = () => {
		setTodos((prev) => prev.filter((todo) => !todo.completed));
	};

	const filteredTodos = todos.filter((todo) => {
		switch (filter) {
			case "active":
				return !todo.completed;
			case "completed":
				return todo.completed;
			default:
				return true;
		}
	});

	const activeCount = todos.filter((todo) => !todo.completed).length;
	const completedCount = todos.filter((todo) => todo.completed).length;

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
			<div className="container mx-auto max-w-2xl px-4 py-8">
				{/* 标题 */}
				<div className="mb-8 text-center">
					<h1 className="mb-2 font-bold text-4xl text-gray-800">
						✨ Todo List
					</h1>
					<p className="text-gray-600">管理您的任务，提高工作效率</p>
				</div>

				{/* 添加新任务 */}
				<div className="mb-6">
					<AddTodo onAdd={addTodo} />
				</div>

				{/* 统计信息 */}
				{todos.length > 0 && (
					<div className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
						<div className="flex items-center justify-between text-gray-600 text-sm">
							<span>
								总计{" "}
								<span className="font-semibold text-gray-800">
									{todos.length}
								</span>{" "}
								个任务
							</span>
							<div className="flex gap-4">
								<span>
									待完成{" "}
									<span className="font-semibold text-blue-600">
										{activeCount}
									</span>
								</span>
								<span>
									已完成{" "}
									<span className="font-semibold text-green-600">
										{completedCount}
									</span>
								</span>
							</div>
						</div>
					</div>
				)}

				{/* 过滤器 */}
				{todos.length > 0 && (
					<div className="mb-6">
						<TodoFilter
							filter={filter}
							onFilterChange={setFilter}
							activeCount={activeCount}
							completedCount={completedCount}
							onClearCompleted={clearCompleted}
						/>
					</div>
				)}

				{/* 任务列表 */}
				<div className="space-y-2">
					{filteredTodos.length === 0 ? (
						<EmptyState filter={filter} hasAnyTodos={todos.length > 0} />
					) : (
						filteredTodos.map((todo) => (
							<TodoItem
								key={todo.id}
								todo={todo}
								onToggle={toggleTodo}
								onDelete={deleteTodo}
								onEdit={editTodo}
							/>
						))
					)}
				</div>

				{/* 底部提示 */}
				<div className="mt-12 text-center text-gray-400 text-sm">
					<p>💡 双击任务文本即可编辑</p>
				</div>
			</div>
		</div>
	);
}
