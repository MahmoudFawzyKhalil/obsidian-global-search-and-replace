import { App, Editor, TFile } from "obsidian";
import { SearchResult } from "./search-result";
import { isBlank } from "../util/utils";

const NEW_LINE_REGEX = /\r?\n|\r|\n/g;

interface SearchOperationResult {
	searchResults: SearchResult[];
	numberOfFilesWithMatches: number;
}

interface ReplaceOperationResult {
	lineSearchResults: SearchResult[];
	filePath: string;
	lineNumber: number;
}

export class FileOperator {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	public async search(query: string): Promise<SearchOperationResult> {
		if (isBlank(query)) {
			return {
				numberOfFilesWithMatches: 0,
				searchResults: [],
			};
		}

		const queryRegex = this.createQueryRegex(query);

		const markdownFiles = this.app.vault.getMarkdownFiles();
		const searchResults: SearchResult[] = [];

		let numberOfFilesWithMatches = 0;

		for (const file of markdownFiles) {
			const contents = await this.app.vault.read(file);
			const lines = this.splitIntoLines(contents);
			let foundAMatchInThisFile = false;

			lines.forEach((line, i) => {
				const intermediateResults: SearchResult[] = this.searchInLine(
					line,
					i + 1,
					file,
					query,
					queryRegex
				);

				if (intermediateResults.length !== 0) {
					foundAMatchInThisFile = true;
				}

				searchResults.push(...intermediateResults);
			});

			if (foundAMatchInThisFile) {
				numberOfFilesWithMatches++;
			}

			foundAMatchInThisFile = false;
		}

		return { searchResults, numberOfFilesWithMatches };
	}

	private createQueryRegex(query: string) {
		return new RegExp(this.escapeRegexString(query), "g");
	}

	private searchInLine(
		line: string,
		lineNumber: number,
		file: TFile,
		query: string,
		queryRegex?: RegExp
	): SearchResult[] {
		const matches = line.matchAll(
			queryRegex ? queryRegex : this.createQueryRegex(query)
		);

		return [...matches].map((match: RegExpMatchArray) => {
			if (match.index === undefined)
				throw new Error(
					"Regex match index was undefined. This should never happen."
				);

			return new SearchResult(
				line,
				lineNumber,
				file.path,
				match.index,
				match.index + query.length - 1,
				file
			);
		});
	}

	private splitIntoLines(contents: string) {
		return contents.split(NEW_LINE_REGEX);
	}

	public async replace(
		searchResult: SearchResult,
		replacementText: string,
		query: string
	): Promise<ReplaceOperationResult | undefined> {
		const file = searchResult.file;
		if (!file) return;

		await this.app.workspace.openLinkText(searchResult.filePath, "");
		const activeEditor = this.app.workspace.activeEditor;

		const editingTheCorrectFile = activeEditor?.file === file;
		if (!editingTheCorrectFile) return;

		const editor: Editor | undefined = activeEditor?.editor;
		if (!editor) return;

		editor.setSelection(
			{
				line: searchResult.lineNumber - 1,
				ch: searchResult.matchStartIndex,
			},
			{
				line: searchResult.lineNumber - 1,
				ch: searchResult.matchEndIndex + 1,
			}
		);

		editor.replaceSelection(replacementText);

		// Force flush of editor change to prevent race condition
		// where if the user edits the query, stale results are returned for a ~1 second
		await this.app.vault.modify(file, editor.getValue());

		// Necessary to update matchStartIndex and matchEndIndex for search results that were on the same line
		const lineSearchResults = this.searchInLine(
			editor.getLine(searchResult.lineNumber - 1),
			searchResult.lineNumber,
			file,
			query
		);

		return {
			lineSearchResults: lineSearchResults,
			filePath: file.path,
			lineNumber: searchResult.lineNumber,
		};
	}

	public async open(searchResult: SearchResult): Promise<ReplaceOperationResult | undefined> {
		if (searchResult.filePath) {
			await this.app.workspace.openLinkText(searchResult.filePath, "");
			const activeEditor = this.app.workspace.activeEditor;

			const editingTheCorrectFile = activeEditor?.file === searchResult.file;
			if (!editingTheCorrectFile) return;
	
			const editor: Editor | undefined = activeEditor?.editor;
			if (!editor) return;
	
		editor.setSelection(
			{
				line: searchResult.lineNumber - 1,
				ch: searchResult.matchStartIndex,
			},
			{
				line: searchResult.lineNumber - 1,
				ch: searchResult.matchEndIndex + 1,
			}
		);
		}
	}

	private escapeRegexString(str: string): string {
		return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}
}
