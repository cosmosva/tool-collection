"use client";

import { useState } from "react";

type Operation = "+" | "-" | "*" | "/" | null;

export function Calculator() {
	const [display, setDisplay] = useState("0");
	const [previousValue, setPreviousValue] = useState<number | null>(null);
	const [operation, setOperation] = useState<Operation>(null);
	const [waitingForOperand, setWaitingForOperand] = useState(false);

	const inputNumber = (num: string) => {
		if (waitingForOperand) {
			setDisplay(num);
			setWaitingForOperand(false);
		} else {
			setDisplay(display === "0" ? num : display + num);
		}
	};

	const inputDecimal = () => {
		if (waitingForOperand) {
			setDisplay("0.");
			setWaitingForOperand(false);
		} else if (display.indexOf(".") === -1) {
			setDisplay(display + ".");
		}
	};

	const clear = () => {
		setDisplay("0");
		setPreviousValue(null);
		setOperation(null);
		setWaitingForOperand(false);
	};

	const performOperation = (nextOperation: Operation) => {
		const inputValue = Number.parseFloat(display);

		if (previousValue === null) {
			setPreviousValue(inputValue);
		} else if (operation) {
			const currentValue = previousValue || 0;
			const newValue = calculate(currentValue, inputValue, operation);

			setDisplay(String(newValue));
			setPreviousValue(newValue);
		}

		setWaitingForOperand(true);
		setOperation(nextOperation);
	};

	const calculate = (
		firstValue: number,
		secondValue: number,
		operation: Operation,
	): number => {
		switch (operation) {
			case "+":
				return firstValue + secondValue;
			case "-":
				return firstValue - secondValue;
			case "*":
				return firstValue * secondValue;
			case "/":
				return secondValue !== 0 ? firstValue / secondValue : 0;
			default:
				return secondValue;
		}
	};

	const handleEquals = () => {
		const inputValue = Number.parseFloat(display);

		if (previousValue !== null && operation) {
			const newValue = calculate(previousValue, inputValue, operation);
			setDisplay(String(newValue));
			setPreviousValue(null);
			setOperation(null);
			setWaitingForOperand(true);
		}
	};

	const buttons = [
		{
			id: "clear",
			label: "C",
			action: clear,
			className: "bg-red-500 hover:bg-red-600 text-white col-span-2",
		},
		{
			id: "backspace",
			label: "←",
			action: () => {
				if (display.length > 1) {
					setDisplay(display.slice(0, -1));
				} else {
					setDisplay("0");
				}
			},
			className: "bg-gray-500 hover:bg-gray-600 text-white",
		},
		{
			id: "divide",
			label: "÷",
			action: () => performOperation("/"),
			className: "bg-blue-500 hover:bg-blue-600 text-white",
		},
		{
			id: "seven",
			label: "7",
			action: () => inputNumber("7"),
			className: "bg-gray-200 hover:bg-gray-300",
		},
		{
			id: "eight",
			label: "8",
			action: () => inputNumber("8"),
			className: "bg-gray-200 hover:bg-gray-300",
		},
		{
			id: "nine",
			label: "9",
			action: () => inputNumber("9"),
			className: "bg-gray-200 hover:bg-gray-300",
		},
		{
			id: "multiply",
			label: "×",
			action: () => performOperation("*"),
			className: "bg-blue-500 hover:bg-blue-600 text-white",
		},
		{
			id: "four",
			label: "4",
			action: () => inputNumber("4"),
			className: "bg-gray-200 hover:bg-gray-300",
		},
		{
			id: "five",
			label: "5",
			action: () => inputNumber("5"),
			className: "bg-gray-200 hover:bg-gray-300",
		},
		{
			id: "six",
			label: "6",
			action: () => inputNumber("6"),
			className: "bg-gray-200 hover:bg-gray-300",
		},
		{
			id: "subtract",
			label: "−",
			action: () => performOperation("-"),
			className: "bg-blue-500 hover:bg-blue-600 text-white",
		},
		{
			id: "one",
			label: "1",
			action: () => inputNumber("1"),
			className: "bg-gray-200 hover:bg-gray-300",
		},
		{
			id: "two",
			label: "2",
			action: () => inputNumber("2"),
			className: "bg-gray-200 hover:bg-gray-300",
		},
		{
			id: "three",
			label: "3",
			action: () => inputNumber("3"),
			className: "bg-gray-200 hover:bg-gray-300",
		},
		{
			id: "add",
			label: "+",
			action: () => performOperation("+"),
			className: "bg-blue-500 hover:bg-blue-600 text-white row-span-2",
		},
		{
			id: "zero",
			label: "0",
			action: () => inputNumber("0"),
			className: "bg-gray-200 hover:bg-gray-300 col-span-2",
		},
		{
			id: "decimal",
			label: ".",
			action: inputDecimal,
			className: "bg-gray-200 hover:bg-gray-300",
		},
		{
			id: "equals",
			label: "=",
			action: handleEquals,
			className: "bg-green-500 hover:bg-green-600 text-white",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
			<div className="container mx-auto max-w-md px-4 py-8">
				{/* 标题 */}
				<div className="mb-8 text-center">
					<h1 className="mb-2 font-bold text-4xl text-gray-800">🧮 计算器</h1>
					<p className="text-gray-600">简单实用的数学运算工具</p>
				</div>

				{/* 计算器主体 */}
				<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
					{/* 显示屏 */}
					<div className="mb-6">
						<div className="rounded-lg bg-gray-900 p-4 text-right">
							<div className="flex min-h-[2.5rem] items-center justify-end font-mono text-3xl text-green-400">
								{display}
							</div>
							{operation && previousValue !== null && (
								<div className="mt-1 text-gray-400 text-sm">
									{previousValue}{" "}
									{operation === "*"
										? "×"
										: operation === "/"
											? "÷"
											: operation === "-"
												? "−"
												: operation}
								</div>
							)}
						</div>
					</div>

					{/* 按钮网格 */}
					<div className="grid grid-cols-4 gap-3">
						{buttons.map((button) => (
							<button
								key={button.id}
								type="button"
								onClick={button.action}
								className={`h-12 rounded-lg font-semibold text-lg shadow-sm transition-all duration-200 active:scale-95 ${button.className}
									${button.label === "C" ? "col-span-2" : ""}
									${button.label === "+" ? "row-span-2" : ""}
									${button.label === "0" ? "col-span-2" : ""}
								`}
							>
								{button.label}
							</button>
						))}
					</div>

					{/* 功能说明 */}
					<div className="mt-6 text-center text-gray-500 text-xs">
						<p>支持加(+)、减(−)、乘(×)、除(÷)四则运算</p>
					</div>
				</div>

				{/* 历史记录提示 */}
				<div className="mt-8 text-center text-gray-400 text-sm">
					<p>💡 点击 C 清除所有内容，点击 ← 删除最后一位数字</p>
				</div>
			</div>
		</div>
	);
}
