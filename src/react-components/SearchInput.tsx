import * as React from "react";
import { EnableRegexButton, EnableRegexButtonProps } from "./EnableRegexButton";
import {EnableCaseSensitivityButton, EnableCaseSensitivityButtonProps} from "./EnableCaseSensitivityButton";

interface SearchInputProps extends EnableRegexButtonProps, EnableCaseSensitivityButtonProps {
	searchInputValue: string;
	onSearchInputChange: React.ChangeEventHandler<HTMLInputElement>;
}

export function SearchInput({
	searchInputValue,
	onSearchInputChange,
	regexEnabled,
	onEnableRegexButtonClick,
	onEnableCaseSensitivityButtonClick,
	caseSensitivityEnabled
}: SearchInputProps) {
	return (
		<div className="snr-input-icon-wrapper">
			<input
				className="prompt-input"
				enterKeyHint="go"
				type="text"
				placeholder="Search"
				autoFocus
				value={searchInputValue}
				onChange={onSearchInputChange}
			/>
			<EnableCaseSensitivityButton
				caseSensitivityEnabled={caseSensitivityEnabled}
				onEnableCaseSensitivityButtonClick={onEnableCaseSensitivityButtonClick}
			/>
			<EnableRegexButton
				regexEnabled={regexEnabled}
				onEnableRegexButtonClick={onEnableRegexButtonClick}
			/>
		</div>
	);
}
