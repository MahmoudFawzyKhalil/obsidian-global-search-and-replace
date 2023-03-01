import { Plugin } from "obsidian";
import { PluginSettings } from "./settings/plugin-settings";
import { SearchAndReplaceModal } from "./obsidian-components/search-and-replace-modal";

export const DEFAULT_SETTINGS: PluginSettings = {
	replaceAllEnabled: false,
};

export default class SearchAndReplacePlugin extends Plugin {
	settings: PluginSettings | undefined;

	async onload() {
		await this.loadSettings();
		this.thisAddPluginCommand();

		// TODO there are no settings yet
		// this.addSettingTab(new SettingsTab(this.app, this));
	}

	private thisAddPluginCommand(): void {
		this.addCommand({
			id: "snr-search-and-replace",
			name: "Search and Replace in all files",
			callback: () => {
				new SearchAndReplaceModal(this.app).open();
			},
		});
	}

	onunload() {
		// Nothing to unload yet
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
