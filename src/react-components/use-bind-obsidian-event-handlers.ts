import * as React from "react";
import { useEffect } from "react";
import eventBridge from "../infrastructure/event-bridge";
import { SearchAndReplaceAction } from "./SearchAndReplace";

export function useBindObsidianEventHandlers(
	dispatch: React.Dispatch<SearchAndReplaceAction>,
	replaceSelection: () => Promise<void>,
	openSelectionInEditor: () => Promise<void>
) {
	// Bind event handlers to events coming from Obsidian
	useEffect(() => {
		eventBridge.onArrowUp = () => dispatch({ type: "move_selection_up" });
		eventBridge.onArrowDown = () => dispatch({ type: "move_selection_down" });
		eventBridge.onEnter = replaceSelection;
		eventBridge.onCommandEnter = openSelectionInEditor;
	}, [replaceSelection, openSelectionInEditor, dispatch]);
}
