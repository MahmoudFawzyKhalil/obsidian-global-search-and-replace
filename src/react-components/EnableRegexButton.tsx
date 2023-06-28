import * as React from "react";

export interface EnableRegexButtonProps {
	regexEnabled: boolean;
	onEnableRegexButtonClick: React.MouseEventHandler<HTMLDivElement>;
}

export function EnableRegexButton({
	regexEnabled,
	onEnableRegexButtonClick,
}: EnableRegexButtonProps) {
	return (
		<div
			className="workspace-tab-header"
			aria-label="Enable regex search"
			aria-label-delay="50"
		>
			<div
				className={`workspace-tab-header-inner snr-workspace-tab-header-inner snr-regex-button ${
					regexEnabled
						? "snr-workspace-tab-header-inner-icon-active"
						: ""
				}`}
				onClick={onEnableRegexButtonClick}
			>
				<div className="workspace-tab-header-inner-icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="svg-icon"
					>
						<path d="M17 3v10"></path>
						<path d="m12.67 5.5 8.66 5"></path>
						<path d="m12.67 10.5 8.66-5"></path>
						<path d="M9 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2z"></path>
					</svg>
				</div>
			</div>
		</div>
	);
}
