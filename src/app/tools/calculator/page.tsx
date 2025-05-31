import { BackButton } from "@/components/BackButton";
import { Calculator } from "@/components/Calculator";

export default function CalculatorPage() {
	return (
		<div className="relative">
			<BackButton />
			<Calculator />
		</div>
	);
}
