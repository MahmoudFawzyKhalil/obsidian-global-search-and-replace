import * as React from "react";
import { SearchResult } from "../domain/search-result";
import SearchResultDisplay from "./SearchResultDisplay";

interface SearchResultsContainerProps {
	searchResults: SearchResult[];
	selectedIndex: number;
	numberOfResultsToDisplay: number;
	onScrollThresholdExceeded: () => void;
	onSelectedIndexChanged: SelectedIndexChangedHandler;
	onSearchResultChosen: SearchResultChosenHandler;
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

function SearchResultsContainer({
	searchResults,
	selectedIndex,
	numberOfResultsToDisplay,
	onSelectedIndexChanged,
	onScrollThresholdExceeded,
	onSearchResultChosen,
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
				onSelectedIndexChanged={onSelectedIndexChanged}
				onSearchResultChosen={onSearchResultChosen}
			/>
		);
	});

	function handleScroll(event: React.UIEvent<HTMLDivElement>) {
		const promptResultsDiv = event.target as HTMLDivElement;

		const elementTotalHeightWithOverflow = promptResultsDiv.scrollHeight;

		const elementActualHeight = promptResultsDiv.offsetHeight;
		const scrollOffsetFromTop = promptResultsDiv.scrollTop;

		const scrollPercentage =
			(scrollOffsetFromTop + elementActualHeight) / elementTotalHeightWithOverflow;

		if (scrollPercentage >= 0.95) {
			onScrollThresholdExceeded();
		}
	}

	return (
		<div onScroll={handleScroll} className="prompt-results">
			{resultsMarkup}
		</div>
	);
}

export default React.memo(SearchResultsContainer);
