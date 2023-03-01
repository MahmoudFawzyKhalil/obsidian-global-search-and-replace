import { App, PluginSettingTab, Setting } from "obsidian";
import SearchAndReplacePlugin, { DEFAULT_SETTINGS } from "../main";

export class SettingsTab extends PluginSettingTab {
	plugin: SearchAndReplacePlugin;

	constructor(app: App, plugin: SearchAndReplacePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		this.containerEl.empty();

		this.containerEl.createEl("h2", {
			text: "Search and Replace",
		});

		const settings = this.plugin.settings || DEFAULT_SETTINGS;

		new Setting(this.containerEl)
			.setName("Replace all")
			.setDesc(
				"⚠️ Enable replace all (Please back up your vault! There is no undo!)"
			)
			.addToggle((b) =>
				b.setValue(settings.replaceAllEnabled).onChange(async (v) => {
					settings.replaceAllEnabled = v;
					await this.plugin.saveSettings();
				})
			);
	}
}
