import * as React from "react";
import { useCallback, useEffect, useState } from "react";
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

const NUMBER_OF_RESULTS_TO_DISPLAY_PER_RENDER = 20;

interface SearchAndReplaceProps {
	fileOperator: FileOperator;
}

export default function SearchAndReplace({
	fileOperator,
}: SearchAndReplaceProps) {
	const [searchText, setSearchText] = useState("");
	const [replaceText, setReplaceText] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [numberOfResultsToDisplay, setNumberOfResultsToDisplay] = useState(
		NUMBER_OF_RESULTS_TO_DISPLAY_PER_RENDER
	);
	const [numberOfFilesWithMatches, setNumberOfFilesWithMatches] = useState(0);

	const handleArrowUp = useCallback(() => {
		setSelectedIndex((i) => {
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

	const handleArrowDown = useCallback(() => {
		setSelectedIndex((i) => {
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

	const handleCommandEnter = useCallback(async () => {
		await fileOperator.open(searchResults[selectedIndex]);
	}, [fileOperator, searchResults, selectedIndex]);

	const handleEnterOrClick = useCallback(async () => {
		if (searchResults.length === 0) return;

		const replaceOperationResult = await fileOperator.replace(
			searchResults[selectedIndex],
			replaceText,
			searchText
		);

		if (!replaceOperationResult) {
			setSearchResults((previousResults) => {
				return previousResults.filter((r, i) => i !== selectedIndex);
			});
		} else {
			setSearchResults((previousResults) => {
				const hasSameFilePathAndLineNumber = (r: SearchResult) => {
					const samePath =
						r.filePath === replaceOperationResult.filePath;
					const sameLineNumber =
						r.lineNumber === replaceOperationResult.lineNumber;
					return samePath && sameLineNumber;
				};

				const firstIndexOfSamePathAndLineNumber =
					previousResults.findIndex(hasSameFilePathAndLineNumber);

				const lastIndexOfSamePathAndLineNumber = findLastIndex(
					previousResults,
					hasSameFilePathAndLineNumber
				);

				// If selectedIndex is out of bounds, reset it
				if (selectedIndex > searchResults.length - 2) {
					setSelectedIndex((s) => s - 1);
				}

				return [
					...previousResults.slice(
						0,
						firstIndexOfSamePathAndLineNumber
					),
					...replaceOperationResult.lineSearchResults,
					...previousResults.slice(
						lastIndexOfSamePathAndLineNumber + 1
					),
				];
			});
		}
	}, [selectedIndex, searchResults, replaceText, searchText, fileOperator]);

	useEffect(() => {
		eventBridge.onArrowUp = handleArrowUp;
		eventBridge.onArrowDown = handleArrowDown;
		eventBridge.onEnter = handleEnterOrClick;
		eventBridge.onCommandEnter = handleCommandEnter;
	}, [handleArrowUp, handleArrowDown, handleEnterOrClick, handleCommandEnter]);

	const handleReplaceInputChanged = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setReplaceText(event.target.value);
	};

	const handleSearchInputChanged = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const query = event.target.value;
		setSearchText(query);

		if (isBlank(query)) {
			setSearchResults([]);
			setNumberOfFilesWithMatches(0);
			return;
		}

		debouncedSearch(query);
	};

	const debouncedSearch = useCallback(
		debounce(
			async (query: string) => {
				const { searchResults, numberOfFilesWithMatches } =
					await fileOperator.search(query);

				setNumberOfFilesWithMatches(numberOfFilesWithMatches);
				setSearchResults(searchResults);
				setSelectedIndex(0);
				scrollIntoView(0);
				setNumberOfResultsToDisplay(
					NUMBER_OF_RESULTS_TO_DISPLAY_PER_RENDER
				);
			},
			500,
			false
		),
		[]
	);

	const scrollThresholdExceededHandler = useCallback(
		() =>
			setNumberOfResultsToDisplay(
				(n) => n + NUMBER_OF_RESULTS_TO_DISPLAY_PER_RENDER
			),
		[]
	);

	const selectedIndexChangedHandler = useCallback((i: number) => {
		setSelectedIndex(i);
		scrollIntoView(i);
	}, []);

	return (
		<>
			<SearchInput
				value={searchText}
				onChange={handleSearchInputChanged}
			/>
			<ReplaceInput
				value={replaceText}
				onChange={handleReplaceInputChanged}
			/>
			<SearchResultsContainer
				selectedIndex={selectedIndex}
				selectedIndexChangedHandler={selectedIndexChangedHandler}
				numberOfResultsToDisplay={numberOfResultsToDisplay}
				searchResults={searchResults}
				scrollThresholdExceededHandler={scrollThresholdExceededHandler}
				searchResultChosenHandler={handleEnterOrClick}
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
