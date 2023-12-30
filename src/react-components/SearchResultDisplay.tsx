import * as React from "react";
import { PropsWithChildren } from "react";
import { SearchResult } from "../domain/search-result";
import { SearchResultChosenHandler, SelectedIndexChangedHandler } from "./SearchResultsContainer";

interface SearchResultDisplayProps extends PropsWithChildren {
	isSelected: boolean;
	searchResult: SearchResult;
	index: number;
	onSelectedIndexChanged: SelectedIndexChangedHandler;
	onSearchResultChosen: SearchResultChosenHandler;
}

export default function SearchResultDisplay({
	isSelected,
	searchResult,
	index,
	onSelectedIndexChanged,
	onSearchResultChosen,
}: SearchResultDisplayProps) {
	return (
		<div
			onPointerMove={() => onSelectedIndexChanged(index)}
			onPointerDown={() => onSelectedIndexChanged(index)}
			onPointerUp={onSearchResultChosen}
			data-search-result-index={index}
			className={`suggestion-item mod-complex ${isSelected ? "is-selected" : ""}`}
		>
			<div className="suggestion-content snr-suggestion-content">
				<div className="suggestion-title">
					{searchResult.getBeforeMatchSubstring()}
					<span className="snr-highlight">{searchResult.getMatchSubstring()}</span>
					{searchResult.getAfterMatchSubstring()}
				</div>
			</div>
			<div className="suggestion-aux snr-suggestion-aux">
				<span className="suggestion-flair snr-suggestion-flair">
					{searchResult.filePath}
				</span>
				<span className="snr-line-number">{searchResult.lineNumber}</span>
			</div>
		</div>
	);
}
