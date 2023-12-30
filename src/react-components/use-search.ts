import * as React from "react";
import { useCallback, useEffect, useMemo } from "react";
import { FileOperator } from "../domain/file-operator";
import { debounce } from "obsidian";
import { SearchAndReplaceAction, SearchAndReplaceState } from "./SearchAndReplace";
import { isBlank } from "../util/utils";

export function useSearch(
	state: SearchAndReplaceState,
	dispatch: React.Dispatch<SearchAndReplaceAction>,
	fileOperator: FileOperator
) {
	const search = useCallback(
		async (query: string, withRegex: boolean, withCaseSensitivity: boolean) => {
			const { searchResults, numberOfFilesWithMatches } = await fileOperator.search(
				query,
				withRegex,
				withCaseSensitivity
			);

			dispatch({
				type: "search",
				payload: {
					nextNumberOfFilesWithMatches: numberOfFilesWithMatches,
					nextSearchResults: searchResults,
				},
			});
		},
		[dispatch, fileOperator]
	);

	// useMemo instead of useCallback because the function is not inline
	// https://kyleshevlin.com/debounce-and-throttle-callbacks-with-react-hooks
	const debouncedSearch = useMemo(
		() =>
			debounce(
				(query: string, withRegex: boolean, withCaseSensitivity: boolean) =>
					search(query, withRegex, withCaseSensitivity),
				300,
				true
			),
		[search]
	);

	useEffect(() => {
		if (isBlank(state.searchQuery)) {
			dispatch({ type: "clear" });
			return;
		}
		debouncedSearch(state.searchQuery, state.regexEnabled, state.caseSensitivityEnabled);
	}, [
		state.searchQuery,
		state.regexEnabled,
		state.caseSensitivityEnabled,
		debouncedSearch,
		dispatch,
	]);
}
