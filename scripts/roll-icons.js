export default class RollIconsModification {
	static abilityIconMap = {
		str: 'icons/skills/melee/unarmed-punch-fist-yellow-red.webp',
		dex: 'icons/skills/targeting/crosshair-triple-strike-orange.webp',
		con: 'icons/magic/life/cross-worn-green.webp',
		int: 'icons/sundries/documents/document-sealed-red-yellow.webp',
		wis: 'icons/magic/perception/orb-eye-scrying.webp',
		cha: 'icons/creatures/birds/corvid-flying-wings-purple.webp'
	};

	static init() {}

	static identify(chatMessage) {
		const flag = chatMessage.getFlag('dnd5e', 'roll');
		if (flag && ['skill', 'save', 'ability'].includes(flag.type)) {
			const roll = chatMessage.rolls[0];
			const dualRolls = roll?.dice[0]?.results;
			const total = roll.total;

			switch (flag.type) {
				case 'skill':
					const skill = CONFIG.DND5E.skills[flag.skillId];
					return {
						icon: this.abilityIconMap[skill.ability],
						title: skill.label,
						total,
						dualRolls
					};
				case 'save':
				case 'ability':
					return {
						icon: this.abilityIconMap[flag.abilityId],
						title: roll.options.flavor,
						total,
						dualRolls
					};
			}
		}
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
