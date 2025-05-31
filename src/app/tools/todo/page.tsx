import { BackButton } from "@/components/BackButton";
import { TodoApp } from "@/components/TodoApp";

export default function TodoPage() {
	return (
		<div className="relative">
			<BackButton />
			<TodoApp />
		</div>
	);
}
