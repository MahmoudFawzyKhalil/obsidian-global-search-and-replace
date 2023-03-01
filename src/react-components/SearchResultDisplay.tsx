import * as React from "react";
import { PropsWithChildren } from "react";
import { SearchResult } from "../domain/search-result";
import {
	SearchResultChosenHandler,
	SelectedIndexChangedHandler,
} from "./SearchResultsContainer";

interface SearchResultDisplayProps extends PropsWithChildren {
	isSelected: boolean;
	searchResult: SearchResult;
	index: number;
	selectedIndexChangeHandler: SelectedIndexChangedHandler;
	searchResultChosenHandler: SearchResultChosenHandler;
}

// TODO useMemo()?
export const SearchResultDisplay = ({
	isSelected,
	searchResult,
	index,
	selectedIndexChangeHandler,
	searchResultChosenHandler,
}: SearchResultDisplayProps) => {
	return (
		<div
			onPointerMove={() => selectedIndexChangeHandler(index)}
			onPointerDown={() => selectedIndexChangeHandler(index)}
			onPointerUp={searchResultChosenHandler}
			data-search-result-index={index}
			className={`suggestion-item mod-complex ${
				isSelected ? "is-selected" : ""
			}`}
		>
			<div className="suggestion-content snr-suggestion-content">
				<div className="suggestion-title">
					{searchResult.getBeforeMatchSubstring()}
					<span className="snr-highlight">
						{searchResult.getMatchSubstring()}
					</span>
					{searchResult.getAfterMatchSubstring()}
				</div>
			</div>
			<div className="suggestion-aux snr-suggestion-aux">
				<span className="suggestion-flair snr-suggestion-flair">
					{searchResult.filePath}
				</span>
				<span className="snr-line-number">
					{searchResult.lineNumber}
				</span>
			</div>
		</div>
	);
};
