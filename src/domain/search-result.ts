import { TFile } from "obsidian";

export class SearchResult {
	line: string;
	matchStartIndex: number;
	matchEndIndex: number;
	filePath: string;
	lineNumber: number;

	file?: TFile;

	public constructor(
		line: string,
		lineNumber: number,
		filePath: string,
		matchStartIndex: number,
		matchEndIndex: number,
		file?: TFile
	) {
		this.line = line;
		this.matchStartIndex = matchStartIndex;
		this.matchEndIndex = matchEndIndex;
		this.filePath = filePath;
		this.lineNumber = lineNumber;
		this.file = file;
	}

	public getBeforeMatchSubstring(): string {
		return this.line.substring(0, this.matchStartIndex);
	}

	public getMatchSubstring(): string {
		return this.line.substring(
			this.matchStartIndex,
			this.matchEndIndex + 1
		);
	}

	getAfterMatchSubstring(): string {
		return this.line.substring(this.matchEndIndex + 1);
	}
}
