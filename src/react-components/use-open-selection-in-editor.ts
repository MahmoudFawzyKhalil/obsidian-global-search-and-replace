import { FileOperator } from "../domain/file-operator";
import { useCallback } from "react";
import { SearchAndReplaceState } from "./SearchAndReplace";

export function useOpenSelectionInEditor(fileOperator: FileOperator, state: SearchAndReplaceState) {
	return useCallback(async () => {
		await fileOperator.open(state.searchResults[state.selectedIndex]);
	}, [fileOperator, state.searchResults, state.selectedIndex]);
}
