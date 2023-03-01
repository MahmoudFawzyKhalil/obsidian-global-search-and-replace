import * as React from "react";

interface ReplaceInputProps {
	value: string;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export function ReplaceInput({ value, onChange }: ReplaceInputProps) {
	return (
		<div className="snr-input-button-wrapper">
			<input
				className="prompt-input"
				enterKeyHint="go"
				type="text"
				placeholder="Replace"
				value={value}
				onChange={onChange}
			/>
			{/* TODO <ReplaceAllButton />*/}
		</div>
	);
}
