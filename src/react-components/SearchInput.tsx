import * as React from "react";

interface SearchInputProps {
	value: string;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
	return (
		<div className="snr-input-icon-wrapper">
			<input
				className="prompt-input"
				enterKeyHint="go"
				type="text"
				placeholder="Search"
				autoFocus
				value={value}
				onChange={onChange}
			/>
			{/* TODO <EnableRegexButton />*/}
		</div>
	);
}
