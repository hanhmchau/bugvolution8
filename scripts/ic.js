import addDamageApplyButtons from './apply-dmg-buttons.js';
import Merger from './merge.js';
import Relayouter from './relayout.js';
import RollIconsModification from './roll-icons.js';

export default class InCharacterMessage {
	static init() {
		libWrapper.register(
			'bugvolution8',
			'ChatMessage.prototype.getHTML',
			async function (wrapped, ...args) {
				const html = await wrapped(...args);

				/** Mutate the html here */
				addMergingClass(this, html);
				addIsMeClass(this, html);
				RollIconsModification.process(this, html);
				addIsRollCardClass(html);
				addNaturalRollClass(this, html);
				addStyleClass(this, html);
				relayout(this, html);
				await addDamageApplyButtons(this, html);
				// appendRetroCrit(this, html);
				/** End mutation */

				return html;
			},
			'WRAPPER'
		);
	}
}

const relayout = (chatMessage, html) => {
	Relayouter.relayout(chatMessage, html);
};

const addMergingClass = (chatMessage, html) => {
	if (Merger.isContinuation(chatMessage)) {
		html.addClass('continued');
	} else {
		html.addClass('leading');
	}
};

const addIsMeClass = (chatMessage, html) => {
	if (chatMessage.user.id === game.user.id) {
		html.addClass('me');
	}
};

const addStyleClass = (chatMessage, html) => {
	let className = 'other';
	switch (chatMessage.style) {
		case 1:
			className = 'ooc';
			break;
		case 2:
			className = 'ic';
			break;
		case 3:
			className = 'emote';
			break;
	}
	html.addClass(className);
};

const addIsRollCardClass = (html) => {
	if (html.find('.card-header.description').length) {
		html.addClass('roll-card');
		html.find('.dnd5e2.evaluation').each((index, element) => {
			if ($(element).children().length === 0) {
				$(element).hide();
			}
		});
	}
};

const addNaturalRollClass = (chatMessage, html) => {
	const naturalRolls = chatMessage.rolls.map((roll) => getNaturalRoll(roll));
	html.find('.dice-roll').each((index, dice) => {
		const natural = naturalRolls[index];
		if (natural.isD20) {
			if (natural.isCritical) {
				$(dice).addClass('crit');
			} else if (natural.isFumble) {
				$(dice).addClass('fumble');
			}
			appendBaseDice(dice, natural.baseRoll);
		}
	});
};

const getNaturalRoll = (roll) => {
	return {
		isD20: roll.validD20Roll,
		baseRoll: roll.validD20Roll ? roll.dice[0].total : 0,
		isCritical: roll.isCritical,
		isFumble: roll.isFumble
	};
};

const appendBaseDice = (dice, number) => {
	const diceValue = number ? number.toString() : '-';
	const baseDice = $('<span></span>').addClass('base-dice').html(diceValue);
	$(dice).find('.dice-total').append(baseDice);
};
