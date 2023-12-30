import * as React from "react";

export function PromptInstructions(): JSX.Element {
	return (
		<div className="prompt-instructions">
			<div className="prompt-instruction">
				<span className="prompt-instruction-command">↑↓</span>
				<span>to navigate</span>
			</div>
			<div className="prompt-instruction">
				<span className="prompt-instruction-command">↵</span>
				<span>to replace</span>
			</div>
			<div className="prompt-instruction">
				<span className="prompt-instruction-command">⌘↵</span>
				<span>to open</span>
			</div>
		</div>
	);
}
