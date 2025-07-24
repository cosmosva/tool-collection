import { BackButton } from "@/components/BackButton";
import { MarkdownProcessor } from "@/components/MarkdownProcessor";

export default function MarkdownPage() {
	return (
		<div className="relative">
			<BackButton />
			<MarkdownProcessor />
		</div>
	);
}
