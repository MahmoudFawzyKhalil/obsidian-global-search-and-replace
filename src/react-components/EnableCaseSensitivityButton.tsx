import * as React from "react";

export interface EnableCaseSensitivityButtonProps {
	caseSensitivityEnabled: boolean;
	onEnableCaseSensitivityButtonClick: React.MouseEventHandler<HTMLDivElement>;
}

export function EnableCaseSensitivityButton({
	caseSensitivityEnabled,
	onEnableCaseSensitivityButtonClick,
}: EnableCaseSensitivityButtonProps) {
	return (
		<div
			className="workspace-tab-header"
			aria-label="Enable case-sensitive search"
			aria-label-delay="50"
		>
			<div
				className={`workspace-tab-header-inner snr-workspace-tab-header-inner ${
					caseSensitivityEnabled
						? "snr-workspace-tab-header-inner-icon-active"
						: ""
				}`}
				onClick={onEnableCaseSensitivityButtonClick}
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
						<path d="m3 15 4-8 4 8" />
						<path d="M4 13h6" />
						<circle cx="18" cy="12" r="3" />
						<path d="M21 9v6" />
					</svg>
				</div>
			</div>
		</div>
	);
}
