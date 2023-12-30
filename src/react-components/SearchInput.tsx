import * as React from "react";
import { EnableRegexButton, EnableRegexButtonProps } from "./EnableRegexButton";
import {
	EnableCaseSensitivityButton,
	EnableCaseSensitivityButtonProps,
} from "./EnableCaseSensitivityButton";

interface SearchInputProps extends EnableRegexButtonProps, EnableCaseSensitivityButtonProps {
	value: string;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export default function SearchInput({
	value,
	onChange,
	regexEnabled,
	onToggleRegexSearch,
	onToggleCaseSensitiveSearch,
	caseSensitivityEnabled,
}: SearchInputProps) {
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
			<EnableCaseSensitivityButton
				caseSensitivityEnabled={caseSensitivityEnabled}
				onToggleCaseSensitiveSearch={onToggleCaseSensitiveSearch}
			/>
			<EnableRegexButton
				regexEnabled={regexEnabled}
				onToggleRegexSearch={onToggleRegexSearch}
			/>
		</div>
	);
}
