import * as React from "react";
import { SearchResult } from "../domain/search-result";
import { SearchResultDisplay } from "./SearchResultDisplay";

interface SearchResultsContainerProps {
	searchResults: SearchResult[];
	selectedIndex: number;
	numberOfResultsToDisplay: number;
	scrollThresholdExceededHandler: () => void;
	selectedIndexChangedHandler: SelectedIndexChangedHandler;
	searchResultChosenHandler: SearchResultChosenHandler;
}

export type SelectedIndexChangedHandler = (newIndex: number) => void;
export type SearchResultChosenHandler = () => Promise<void>;

function createKey(searchResult: SearchResult) {
	return (
		searchResult.line +
		searchResult.matchStartIndex +
		searchResult.filePath +
		searchResult.lineNumber
	);
}

export function SearchResultsContainer({
	searchResults,
	selectedIndex,
	numberOfResultsToDisplay,
	selectedIndexChangedHandler,
	scrollThresholdExceededHandler,
	searchResultChosenHandler,
}: SearchResultsContainerProps) {
	const resultsMarkup = searchResults.map((searchResult, index) => {
		const key = createKey(searchResult);

		if (index >= numberOfResultsToDisplay) return null;

		return (
			<SearchResultDisplay
				key={key}
				index={index}
				isSelected={index == selectedIndex}
				searchResult={searchResult}
				selectedIndexChangeHandler={selectedIndexChangedHandler}
				searchResultChosenHandler={searchResultChosenHandler}
			/>
		);
	});

	function handleScroll(event: React.UIEvent<HTMLDivElement>): void {
		const promptResultsDiv = event.target as HTMLDivElement;

		const elementTotalHeightWithOverflow = promptResultsDiv.scrollHeight;

		const elementActualHeight = promptResultsDiv.offsetHeight;
		const scrollOffsetFromTop = promptResultsDiv.scrollTop;

		const scrollPercentage =
			(scrollOffsetFromTop + elementActualHeight) /
			elementTotalHeightWithOverflow;

		if (scrollPercentage >= 0.95) {
			scrollThresholdExceededHandler();
		}
	}

	return (
		<div onScroll={handleScroll} className="prompt-results">
			{resultsMarkup}
		</div>
	);
}
