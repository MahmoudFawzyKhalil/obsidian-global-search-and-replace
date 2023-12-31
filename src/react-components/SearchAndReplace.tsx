import * as React from "react";
import { useCallback, useReducer } from "react";
import { PromptInstructions } from "./PromptInstructions";
import SearchInput from "./SearchInput";
import { ReplaceInput } from "./ReplaceInput";
import SearchResultsContainer from "./SearchResultsContainer";
import { SearchResult } from "../domain/search-result";
import { findLastIndex } from "../util/utils";
import { ResultsNumberSummary } from "./ResultsNumberSummary";
import { FileOperator, ReplaceOperationResult } from "../domain/file-operator";
import { useReplaceSelection } from "./use-replace-selection";
import { useScrollSelectedSearchResultIntoView } from "./use-scroll-selected-search-result-into-view";
import { useOpenSelectionInEditor } from "./use-open-selection-in-editor";
import { useBindObsidianEventHandlers } from "./use-bind-obsidian-event-handlers";
import { useSearch } from "./use-search";

const NUMBER_OF_RESULTS_TO_DISPLAY_PER_BATCH = 20;

interface SearchAndReplaceProps {
	fileOperator: FileOperator;
}

export interface SearchAndReplaceState {
	searchQuery: string;
	replacementText: string;
	selectedIndex: number;
	numberOfResultsToDisplay: number;
	regexEnabled: boolean;
	caseSensitivityEnabled: boolean;
	searchResults: SearchResult[];
	numberOfFilesWithMatches: number;
}

export type SearchAndReplaceAction =
	| { type: "clear" }
	| { type: "move_selection_up" }
	| { type: "move_selection_down" }
	| { type: "update_replacement_text"; nextReplacementText: string }
	| { type: "update_search_query"; nextSearchQuery: string }
	| { type: "update_selected_index"; nextSelectedIndex: number }
	| { type: "toggle_regex_enabled" }
	| { type: "toggle_case_sensitivity_enabled" }
	| { type: "scroll_threshold_exceeded" }
	| {
			type: "search";
			payload: { nextSearchResults: SearchResult[]; nextNumberOfFilesWithMatches: number };
	  }
	| { type: "replace"; replaceOperationResult?: ReplaceOperationResult };

function reducer(
	state: SearchAndReplaceState,
	action: SearchAndReplaceAction
): SearchAndReplaceState {
	switch (action.type) {
		case "clear": {
			return {
				...state,
				searchResults: [],
				numberOfFilesWithMatches: 0,
			};
		}
		case "move_selection_up": {
			const { selectedIndex } = state;
			const nextSelectedIndex = selectedIndex === 0 ? selectedIndex : selectedIndex - 1;
			return { ...state, selectedIndex: nextSelectedIndex };
		}
		case "move_selection_down": {
			const { selectedIndex, searchResults } = state;
			const nextSelectedIndex =
				selectedIndex === searchResults.length - 1 ? selectedIndex : selectedIndex + 1;
			return { ...state, selectedIndex: nextSelectedIndex };
		}
		case "update_replacement_text": {
			const { nextReplacementText } = action;
			return { ...state, replacementText: nextReplacementText };
		}
		case "update_selected_index": {
			const { nextSelectedIndex } = action;
			return { ...state, selectedIndex: nextSelectedIndex };
		}
		case "toggle_regex_enabled": {
			const { regexEnabled } = state;
			return { ...state, regexEnabled: !regexEnabled };
		}
		case "toggle_case_sensitivity_enabled": {
			const { caseSensitivityEnabled } = state;
			return { ...state, caseSensitivityEnabled: !caseSensitivityEnabled };
		}
		case "scroll_threshold_exceeded": {
			const { numberOfResultsToDisplay } = state;
			const nextNumberOfResultsToDisplay =
				numberOfResultsToDisplay + NUMBER_OF_RESULTS_TO_DISPLAY_PER_BATCH;
			return { ...state, numberOfResultsToDisplay: nextNumberOfResultsToDisplay };
		}
		case "search": {
			const { nextSearchResults, nextNumberOfFilesWithMatches } = action.payload;
			return {
				...state,
				searchResults: nextSearchResults,
				numberOfFilesWithMatches: nextNumberOfFilesWithMatches,
				selectedIndex: 0,
				numberOfResultsToDisplay: NUMBER_OF_RESULTS_TO_DISPLAY_PER_BATCH,
			};
		}
		case "update_search_query": {
			const { nextSearchQuery } = action;
			return { ...state, searchQuery: nextSearchQuery };
		}
		case "replace": {
			const { replaceOperationResult } = action;
			const { searchResults, selectedIndex } = state;

			if (!replaceOperationResult) {
				const nextSearchResults = searchResults.filter((_, i) => i !== selectedIndex);
				return { ...state, searchResults: nextSearchResults };
			}

			const hasSameFilePathAndLineNumber = (r: SearchResult) => {
				const samePath = r.filePath === replaceOperationResult.filePath;
				const sameLineNumber = r.lineNumber === replaceOperationResult.lineNumber;
				return samePath && sameLineNumber;
			};

			const firstIndexOfSamePathAndLineNumber = searchResults.findIndex(
				hasSameFilePathAndLineNumber
			);

			const lastIndexOfSamePathAndLineNumber = findLastIndex(
				searchResults,
				hasSameFilePathAndLineNumber
			);

			const outOfBounds = selectedIndex > searchResults.length - 2;
			const nextSelectedIndex = outOfBounds ? selectedIndex - 1 : selectedIndex;

			const nextSearchResults = [
				...searchResults.slice(0, firstIndexOfSamePathAndLineNumber),
				...replaceOperationResult.lineSearchResults,
				...searchResults.slice(lastIndexOfSamePathAndLineNumber + 1),
			];

			return {
				...state,
				searchResults: nextSearchResults,
				selectedIndex: nextSelectedIndex,
			};
		}
		default: {
			throw new Error(`Unhandled action type: ${action}`);
		}
	}
}

export default function SearchAndReplace({ fileOperator }: SearchAndReplaceProps) {
	const [state, dispatch] = useReducer(reducer, {
		searchQuery: "",
		replacementText: "",
		selectedIndex: 0,
		numberOfResultsToDisplay: NUMBER_OF_RESULTS_TO_DISPLAY_PER_BATCH,
		regexEnabled: false,
		caseSensitivityEnabled: false,
		searchResults: [],
		numberOfFilesWithMatches: 0,
	});


	useSearch(state, dispatch, fileOperator);
	useScrollSelectedSearchResultIntoView(state.selectedIndex);

	const replaceSelection = useReplaceSelection(state, dispatch, fileOperator);
	const openSelectionInEditor = useOpenSelectionInEditor(fileOperator, state);
	useBindObsidianEventHandlers(dispatch, replaceSelection, openSelectionInEditor);

	const handleReplaceInputChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		dispatch({ type: "update_replacement_text", nextReplacementText: event.target.value });
	}, []);

	const handleSearchInputChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		dispatch({ type: "update_search_query", nextSearchQuery: event.target.value });
	}, []);

	const handleScrollThresholdExceeded = useCallback(() => {
		dispatch({ type: "scroll_threshold_exceeded" });
	}, []);

	const handleSelectedIndexChanged = useCallback((i: number) => {
		dispatch({ type: "update_selected_index", nextSelectedIndex: i });
	}, []);

	const handleToggleRegexSearch = useCallback(() => {
		dispatch({ type: "clear" });
		dispatch({ type: "toggle_regex_enabled" });
	}, []);

	const handleToggleCaseSensitiveSearch = useCallback(() => {
		dispatch({ type: "clear" });
		dispatch({ type: "toggle_case_sensitivity_enabled" });
	}, []);

	return (
		<>
			<SearchInput
				value={state.searchQuery}
				onChange={handleSearchInputChanged}
				regexEnabled={state.regexEnabled}
				onToggleRegexSearch={handleToggleRegexSearch}
				caseSensitivityEnabled={state.caseSensitivityEnabled}
				onToggleCaseSensitiveSearch={handleToggleCaseSensitiveSearch}
			/>
			<ReplaceInput value={state.replacementText} onChange={handleReplaceInputChanged} />
			<SearchResultsContainer
				searchResults={state.searchResults}
				selectedIndex={state.selectedIndex}
				numberOfResultsToDisplay={state.numberOfResultsToDisplay}
				onSelectedIndexChanged={handleSelectedIndexChanged}
				onScrollThresholdExceeded={handleScrollThresholdExceeded}
				onSearchResultChosen={replaceSelection}
			/>
			<ResultsNumberSummary
				numberOfResults={state.searchResults.length}
				numberOfFilesWithMatches={state.numberOfFilesWithMatches}
			/>
			<PromptInstructions />
		</>
	);
}
