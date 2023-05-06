import * as React from "react";

export const PromptInstructions: React.FC = () => (
	<div className="prompt-instructions">
		<div className="prompt-instruction">
			<span className="prompt-instruction-command">↑↓</span>
			<span>to navigate</span>
		</div>
		<div className="prompt-instruction">
			<span className="prompt-instruction-command">↵</span>
			<span>to open</span>
		</div>
		<div className="prompt-instruction">
			<span className="prompt-instruction-command">⌘↵</span>
			<span>to replace</span>
		</div>
	</div>
);
