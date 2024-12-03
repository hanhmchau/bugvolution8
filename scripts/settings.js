import { changeFontSize } from './ic.js';

export const ModuleOptions = {
	MAXIMUM_TIME_BETWEEN_MERGE: 'chat.merge.maximumTime',
	FONT_SIZE: 'chat.font.size'
};

export class ModuleSettings {
	static MODULE_NAME = 'bugvolution8';

	static registerSettings() {
		game.settings.register(
			this.MODULE_NAME,
			ModuleOptions.MAXIMUM_TIME_BETWEEN_MERGE,
			this._buildConfig(ModuleOptions.MAXIMUM_TIME_BETWEEN_MERGE, {
				type: Number,
				default: 15
			})
		);
		game.settings.register(
			this.MODULE_NAME,
			ModuleOptions.FONT_SIZE,
			this._buildConfig(ModuleOptions.FONT_SIZE, {
				type: new foundry.data.fields.NumberField({
					min: 8,
					max: 24,
					step: 1,
					initial: 14,
					nullable: false
				}),
				default: 14,
				onChange: changeFontSize
			})
		);
	}

	static getSetting(option) {
		return game.settings.get(this.MODULE_NAME, option);
	}

	/** @private */
	static _getNameConfig(optionName) {
		return {
			name: `${this.MODULE_NAME}.${optionName}-s`,
			hint: `${this.MODULE_NAME}.${optionName}-l`
		};
	}

	/** @private */
	static _buildConfig(optionName, config = {}) {
		const defaultConfig = {
			scope: 'client',
			config: true,
			default: false,
			type: Boolean,
			onChange: (x) => window.location.reload()
		};
		return {
			...defaultConfig,
			...this._getNameConfig(optionName),
			...config
		};
	}
}
