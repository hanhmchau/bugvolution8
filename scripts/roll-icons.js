export default class RollIconsModification {
	static _check = (stat) => `${stat} ability check`;
	static _save = (stat) => `${stat} saving throw`;
	static _skill = (stat) => `${stat} skill check`;

	static abilityMap = new Map();
	static skillMap = new Map();

	static abilities = {
		str: {
			label: 'strength',
			icon: 'icons/skills/melee/unarmed-punch-fist-yellow-red.webp',
			skills: ['Athletics']
		},
		dex: {
			label: 'dexterity',
			icon: 'icons/skills/targeting/crosshair-triple-strike-orange.webp',
			skills: ['Acrobatics', 'Sleight of Hand', 'Stealth']
		},
		con: {
			label: 'constitution',
			icon: 'icons/magic/life/cross-worn-green.webp',
			skills: []
		},
		int: {
			label: 'intelligence',
			icon: 'icons/sundries/documents/document-sealed-red-yellow.webp',
			skills: ['Arcana', 'History', 'Investigation', 'Nature', 'Religion']
		},
		wis: {
			label: 'wisdom',
			icon: 'icons/magic/perception/orb-eye-scrying.webp',
			skills: ['Animal Handling', 'Insight', 'Medicine', 'Perception', 'Survival']
		},
		cha: {
			label: 'charisma',
			icon: 'icons/creatures/birds/corvid-flying-wings-purple.webp',
			skills: ['Deception', 'Intimidation', 'Performance', 'Persuasion']
		}
	};

	static init() {
		for (const key in this.abilities) {
			const item = this.abilities[key];

			this.abilityMap.set(this._check(item.label), key);
			this.abilityMap.set(this._save(item.label), key);

			for (const skill of item.skills) {
				this.skillMap.set(this._skill(skill.toLowerCase()), {
					key,
					label: skill
				});
			}
		}
	}

	static identify(chatMessage) {
		const flavor = chatMessage.flavor.trim().toLowerCase();

		if (this._isAbility(flavor)) {
			const key = this.abilityMap.get(flavor);

			return {
				icon: this.abilities[key].icon,
				title: chatMessage.flavor
			};
		} else if (this._isSkill(flavor)) {
			const key = this.skillMap.get(flavor).key;

			return {
				icon: this.abilities[key].icon,
				title: this.skillMap.get(flavor).label
			};
		}
	}

	static _isSkill(flavor) {
		return this.skillMap.has(flavor);
	}

	static _isAbility(flavor) {
		return this.abilityMap.has(flavor);
	}

	static process(chatMessage, html) {
		const result = this.identify(chatMessage);

		if (result) {
			const text = $(`<section class="card-header check description collapsible">
				<header class="summary">
				<img class="gold-icon" src="${result.icon}">
				<div class="name-stacked border">
					<span class="title">${result.title}</span>
				</div>
				</header>
			</section>`);
			$(html).find('.message-content').prepend(text);
			$(html).find('.flavor-text').hide();
			$(html).addClass('check');
		}
	}
}
