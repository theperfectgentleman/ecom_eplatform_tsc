import React from "react";

interface ShimmerProps {
	className?: string;
}

const Shimmer: React.FC<ShimmerProps> = ({ className = "" }) => {
	return (
		<div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded ${className}`}>
			<div className="h-full w-full bg-transparent"></div>
		</div>
	);
};

// Shimmer for card content
export const ShimmerCard: React.FC = () => (
	<div className="p-6 space-y-4">
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{[1, 2, 3, 4].map((i) => (
				<div key={i} className="border rounded-lg p-4 space-y-3">
					<div className="flex items-center space-x-2 mb-3">
						<Shimmer className="h-5 w-5 rounded" />
						<Shimmer className="h-5 w-32 rounded" />
					</div>
					{[1, 2, 3].map((j) => (
						<div key={j} className="space-y-2">
							<Shimmer className="h-3 w-20 rounded" />
							<Shimmer className="h-4 w-full rounded" />
						</div>
					))}
				</div>
			))}
		</div>
	</div>
);

// Shimmer for list items
export const ShimmerList: React.FC = () => (
	<div className="p-6 space-y-4">
		{[1, 2, 3].map((i) => (
			<div key={i} className="border rounded-lg p-4">
				<div className="flex items-center justify-between mb-3">
					<Shimmer className="h-6 w-40 rounded" />
					<Shimmer className="h-5 w-16 rounded-full" />
				</div>
				<Shimmer className="h-4 w-32 rounded mb-4" />
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{[1, 2, 3, 4, 5, 6].map((j) => (
						<div key={j} className="space-y-2">
							<Shimmer className="h-3 w-20 rounded" />
							<Shimmer className="h-4 w-full rounded" />
						</div>
					))}
				</div>
			</div>
		))}
	</div>
);

export default Shimmer;
