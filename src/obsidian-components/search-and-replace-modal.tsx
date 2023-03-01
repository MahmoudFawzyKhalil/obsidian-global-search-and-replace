import { App, Modal } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import * as React from "react";
import SearchAndReplace from "../react-components/SearchAndReplace";
import eventBridge from "../infrastructure/event-bridge";

export class SearchAndReplaceModal extends Modal {
	root: Root | undefined;

	constructor(app: App) {
		super(app);
		this.prepareModalEl();
		this.initReactRoot();
		this.registerEventListeners();
	}

	private initReactRoot() {
		this.root = createRoot(this.modalEl);
	}

	private prepareModalEl() {
		this.modalEl.replaceChildren();
		this.modalEl.addClass("prompt");
		this.modalEl.removeClass("modal");
	}

	private registerEventListeners() {
		// Move selection to previous note
		this.scope.register([], "ArrowUp", (e, ctx) => {
			e.preventDefault();
			eventBridge.onArrowUp?.(e, ctx);
		});

		// Move selection to next note
		this.scope.register([], "ArrowDown", (e, ctx) => {
			e.preventDefault();
			eventBridge.onArrowDown?.(e, ctx);
		});

		// Replace note at selectedIndex
		this.scope.register([], "Enter", (e, ctx) => {
			e.preventDefault();

			// Prevent press and hold
			if (e.repeat) return;

			eventBridge.onEnter?.(e, ctx);
		});
	}

	onOpen() {
		if (!this.root) return;
		this.root.render(
			<React.StrictMode>
				<SearchAndReplace />
			</React.StrictMode>
		);
	}

	onClose() {
		if (!this.root) return;
		this.root.unmount();
	}
}
