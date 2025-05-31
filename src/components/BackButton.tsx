"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
	const router = useRouter();

	return (
		<button
			type="button"
			onClick={() => router.back()}
			className="fixed top-6 left-6 z-50 rounded-full border border-gray-200 bg-white p-3 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
			title="返回"
		>
			<svg
				className="h-5 w-5 text-gray-600"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-label="返回"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M15 19l-7-7 7-7"
				/>
			</svg>
		</button>
	);
}
