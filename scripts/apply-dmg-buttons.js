import RenderUtility from './render.js';

const addDamageApplyButtons = async (chatMessage, html) => {
	const render = await RenderUtility.render('apply-dmg-buttons.hbs', {});
	setTimeout(() => {
		const midi = chatMessage.flags['midi-qol'];
		const baseDamageParts = midi?.damageDetail || [];
		const otherDamageParts = midi?.otherDamageDetail || [];
		const bonusDamageParts = midi?.bonusDamageDetail || [];
		const dmgParts = [...baseDamageParts, ...otherDamageParts, ...bonusDamageParts];

		const tooltips = html.find(':is(.midi-damage-roll,.midi-qol-other-damage-roll) .dice-tooltip .tooltip-part:not(.constant)');

		dmgParts.forEach((dmgDetail, index) => {
			const dmgButtons = $(render);
			attachListeners(dmgDetail, chatMessage, dmgButtons);
			tooltips.eq(index).append(dmgButtons);
		});
	}, 250);
};

const attachListeners = async (dmgDetail, chatMessage, buttons) => {
	buttons.find('button').on('click', async function (ev) {
		ev.stopPropagation();

		const action = $(this).attr('data-action');
		const multiplier = parseFloat($(this).attr('data-multiplier'));

		for (let token of canvas.tokens.controlled) {
			switch (action) {
				case 'apply-heal':
					await token.actor.applyDamage([{ type: 'healing', value: dmgDetail.value }]);
					break;
				case 'apply-damage':
					await token.actor.applyDamage([{ type: 'none', value: Math.floor(dmgDetail.value * multiplier) }]);
					break;
				case 'apply-temp':
					await token.actor.applyTempHP(dmgDetail.value);
					break;
				default:
					break;
			}
		}
	});
};

export default addDamageApplyButtons;
