import * as React from "react";

interface ResultsNumberSummaryProps {
	numberOfResults: number;
	numberOfFilesWithMatches: number;
}
export function ResultsNumberSummary({
	numberOfResults,
	numberOfFilesWithMatches,
}: ResultsNumberSummaryProps) {
	return (
		<div className="snr-result-summary">
			{numberOfResults} matches found in {numberOfFilesWithMatches} files
		</div>
	);
}
