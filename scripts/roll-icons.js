export default class RollIconsModification {
	static abilityMap = {
		str: ['strength check', 'strength save', 'athletics'],
		dex: ['dexterity check', 'dexterity save', 'acrobatics', 'sleight of hand', 'stealth'],
		con: ['constitution check', 'constitution save'],
		int: ['intelligence check', 'intelligence save', 'arcana', 'history', 'investigation', 'nature', 'religion'],
		wis: ['wisdom check', 'wisdom save', 'animal handling', 'insight', 'medicine', 'perception', 'survival'],
		cha: ['charisma check', 'charisma save', 'deception', 'intimidation', 'performance', 'persuasion']
	};

	static abilityIcon = {
		str: 'systems/dnd5e/icons/skills/blood_11.jpg',
		dex: 'systems/dnd5e/icons/skills/yellow_35.jpg',
		con: 'systems/dnd5e/icons/skills/green_19.jpg',
		int: 'systems/dnd5e/icons/skills/red_26.jpg',
		wis: 'systems/dnd5e/icons/skills/emerald_11.jpg',
		cha: 'systems/dnd5e/icons/skills/violet_18.jpg'
	};

	static init() {
		for (const key in this.abilityMap) {
			for (const item of this.abilityMap[key]) {
				this.keyMap[item] = key;
			}
		}
	}

	static keyMap = {};

	static process(chatMessage, html) {
		const type = chatMessage.BetterRoll?.fields[0][1]?.title?.toLowerCase();
		if (type) {
			const icon = this.abilityIcon[this.keyMap[type]];
			if (icon) {
				$(html).find('.item-card .message-portrait').attr('src', icon);
			}
		}
	}

	static _getSkillCheckImage(skill) {
		switch (skill) {
			case 'str':
				return 'systems/dnd5e/icons/skills/blood_11.jpg';
			case 'dex':
				return 'systems/dnd5e/icons/skills/yellow_35.jpg';
			case 'con':
				return 'systems/dnd5e/icons/skills/green_19.jpg';
			case 'int':
				return 'systems/dnd5e/icons/skills/red_26.jpg';
			case 'wis':
				return 'systems/dnd5e/icons/skills/emerald_11.jpg';
			case 'cha':
				return 'systems/dnd5e/icons/skills/violet_18.jpg';
			default:
				return '';
		}
	}
}
