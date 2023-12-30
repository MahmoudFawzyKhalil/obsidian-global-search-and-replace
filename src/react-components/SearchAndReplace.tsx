import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PromptInstructions } from "./PromptInstructions";
import { SearchInput } from "./SearchInput";
import { ReplaceInput } from "./ReplaceInput";
import { SearchResultsContainer } from "./SearchResultsContainer";
import { SearchResult } from "../domain/search-result";
import eventBridge from "../infrastructure/event-bridge";
import { findLastIndex, isBlank } from "../util/utils";
import { ResultsNumberSummary } from "./ResultsNumberSummary";
import { debounce } from "obsidian";
import { FileOperator } from "../domain/file-operator";

const INITIAL_NUMBER_OF_RESULTS_TO_DISPLAY_PER_RENDER = 20;

interface SearchAndReplaceProps {
	fileOperator: FileOperator;
}

export default function SearchAndReplace({ fileOperator }: SearchAndReplaceProps) {
	const [searchText, setSearchText] = useState("");
	const [replaceText, setReplaceText] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [numberOfResultsToDisplay, setNumberOfResultsToDisplay] = useState(
		INITIAL_NUMBER_OF_RESULTS_TO_DISPLAY_PER_RENDER
	);
	const [regexEnabled, setRegexEnabled] = useState(false);
	const [caseSensitivityEnabled, setCaseSensitivityEnabled] = useState(false);
	const [numberOfFilesWithMatches, setNumberOfFilesWithMatches] = useState(0);

	const moveSelectionUp = useCallback(() => {
		setSelectedIndex(i => {
			let newIndex;
			if (i === 0) {
				newIndex = i;
			} else {
				newIndex = i - 1;
			}
			scrollIntoView(newIndex);
			return newIndex;
		});
	}, []);

	const moveSelectionDown = useCallback(() => {
		setSelectedIndex(i => {
			let newIndex;
			if (i === searchResults.length - 1) {
				newIndex = i;
			} else {
				newIndex = i + 1;
			}
			scrollIntoView(newIndex);
			return newIndex;
		});
	}, [searchResults]);

	const replaceSelection = useCallback(async () => {
		if (searchResults.length === 0) return;

		const replaceOperationResult = await fileOperator.replace(
			searchResults[selectedIndex],
			replaceText,
			searchText,
			regexEnabled,
			caseSensitivityEnabled
		);

		if (!replaceOperationResult) {
			setSearchResults(previousResults => {
				return previousResults.filter((_, i) => i !== selectedIndex);
			});
		} else {
			setSearchResults(previousResults => {
				const hasSameFilePathAndLineNumber = (r: SearchResult) => {
					const samePath = r.filePath === replaceOperationResult.filePath;
					const sameLineNumber = r.lineNumber === replaceOperationResult.lineNumber;
					return samePath && sameLineNumber;
				};

				const firstIndexOfSamePathAndLineNumber = previousResults.findIndex(
					hasSameFilePathAndLineNumber
				);

				const lastIndexOfSamePathAndLineNumber = findLastIndex(
					previousResults,
					hasSameFilePathAndLineNumber
				);

				// If selectedIndex is out of bounds, reset it
				if (selectedIndex > searchResults.length - 2) {
					setSelectedIndex(s => s - 1);
				}

				return [
					...previousResults.slice(0, firstIndexOfSamePathAndLineNumber),
					...replaceOperationResult.lineSearchResults,
					...previousResults.slice(lastIndexOfSamePathAndLineNumber + 1),
				];
			});
		}
	}, [
		searchResults,
		fileOperator,
		selectedIndex,
		replaceText,
		searchText,
		regexEnabled,
		caseSensitivityEnabled,
	]);

	const openSelectionInEditor = useCallback(async () => {
		await fileOperator.open(searchResults[selectedIndex]);
	}, [fileOperator, searchResults, selectedIndex]);

	// Bind event handlers to events coming from Obsidian
	useEffect(() => {
		eventBridge.onArrowUp = moveSelectionUp;
		eventBridge.onArrowDown = moveSelectionDown;
		eventBridge.onEnter = replaceSelection;
		eventBridge.onCommandEnter = openSelectionInEditor;
	}, [moveSelectionUp, moveSelectionDown, replaceSelection, openSelectionInEditor]);
	const handleReplaceInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
		setReplaceText(event.target.value);
	};

	const search = useCallback(
		async (query: string, withRegex: boolean, withCaseSensitivity: boolean) => {
			const { searchResults, numberOfFilesWithMatches } = await fileOperator.search(
				query,
				withRegex,
				withCaseSensitivity
			);

			setNumberOfFilesWithMatches(numberOfFilesWithMatches);
			setSearchResults(searchResults);
			setSelectedIndex(0);
			scrollIntoView(0);
			setNumberOfResultsToDisplay(INITIAL_NUMBER_OF_RESULTS_TO_DISPLAY_PER_RENDER);
		},
		[fileOperator]
	);

	// useMemo instead of useCallback because the function is not inline
	// https://kyleshevlin.com/debounce-and-throttle-callbacks-with-react-hooks
	const debouncedSearch = useMemo(
		() =>
			debounce(
				(query: string, withRegex: boolean, withCaseSensitivity: boolean) =>
					search(query, withRegex, withCaseSensitivity),
				500,
				false
			),
		[search]
	);

	const clearResults = useCallback(() => {
		setSearchResults([]);
		setNumberOfFilesWithMatches(0);
	}, []);

	const doSearch = useCallback(
		(query: string, withRegex: boolean, withCaseSensitivity: boolean) => {
			setSearchText(query);
			if (isBlank(query)) {
				clearResults();
				return;
			}
			debouncedSearch(query, withRegex, withCaseSensitivity);
		},
		[clearResults, debouncedSearch]
	);

	const handleSearchInputChanged = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const query = event.target.value;
			doSearch(query, regexEnabled, caseSensitivityEnabled);
		},
		[caseSensitivityEnabled, doSearch, regexEnabled]
	);

	const scrollThresholdExceededHandler = useCallback(
		() => setNumberOfResultsToDisplay(n => n + INITIAL_NUMBER_OF_RESULTS_TO_DISPLAY_PER_RENDER),
		[]
	);

	const selectedIndexChangedHandler = useCallback((i: number) => {
		setSelectedIndex(i);
		scrollIntoView(i);
	}, []);

	const regexButtonClickedHandler = useCallback(() => {
		clearResults();
		setRegexEnabled(p => {
			const newRegexEnabled = !p;
			doSearch(searchText, newRegexEnabled, caseSensitivityEnabled);
			return newRegexEnabled;
		});
	}, [caseSensitivityEnabled, clearResults, doSearch, searchText]);

	const caseSensitivityButtonClickedHandler = useCallback(() => {
		clearResults();
		setCaseSensitivityEnabled(p => {
			const newCaseSensitivityEnabled = !p;
			doSearch(searchText, regexEnabled, newCaseSensitivityEnabled);
			return newCaseSensitivityEnabled;
		});
	}, [clearResults, doSearch, regexEnabled, searchText]);

	return (
		<>
			<SearchInput
				searchInputValue={searchText}
				onSearchInputChange={handleSearchInputChanged}
				onEnableRegexButtonClick={regexButtonClickedHandler}
				regexEnabled={regexEnabled}
				onEnableCaseSensitivityButtonClick={caseSensitivityButtonClickedHandler}
				caseSensitivityEnabled={caseSensitivityEnabled}
			/>
			<ReplaceInput value={replaceText} onChange={handleReplaceInputChanged} />
			<SearchResultsContainer
				selectedIndex={selectedIndex}
				selectedIndexChangedHandler={selectedIndexChangedHandler}
				numberOfResultsToDisplay={numberOfResultsToDisplay}
				searchResults={searchResults}
				scrollThresholdExceededHandler={scrollThresholdExceededHandler}
				searchResultChosenHandler={replaceSelection}
			/>
			<ResultsNumberSummary
				numberOfResults={searchResults.length}
				numberOfFilesWithMatches={numberOfFilesWithMatches}
			/>
			<PromptInstructions />
		</>
	);
}

function scrollIntoView(selectedIndex: number) {
	const searchResultElement = document.querySelector(
		`[data-search-result-index="${selectedIndex}"]`
	);

	searchResultElement?.scrollIntoView({ behavior: "auto", block: "nearest" });
}
