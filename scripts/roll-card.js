export const addIsRollCardClass = (html) => {
	if (html.find('.card-header.description').length) {
		html.addClass('roll-card');
		html.find('.dnd5e2.evaluation').each((index, element) => {
			if ($(element).children().length === 0) {
				$(element).hide();
			}
		});
	}
};

export const addNaturalRollClass = (chatMessage, html) => {
	const naturalRolls = chatMessage.rolls.map((roll) => getNaturalRoll(roll));
	if (naturalRolls.length > 0) {
		html.addClass('roll');
	}
	$(html).find('.dice-total').wrap("<div class='dice-totals'></div>");

	html.find('.dice-roll').each((index, dice) => {
		const natural = naturalRolls[index];

		if (natural.isD20) {
			const diceTotalsContainer = $(dice).find('.dice-totals');
			diceTotalsContainer.empty();
			natural.diceRolls.forEach((diceRoll, index) => {
				diceTotalsContainer.append(_buildDiceTotal(diceRoll));
			});

			const diceTotals = $(dice).find('.dice-total');
			natural.diceRolls.forEach((diceRoll, index) => {
				const diceTotal = diceTotals.eq(index);
				diceTotal.removeClass('critical');
				if (diceRoll.isCritical) {
					diceTotal.addClass('crit');
				} else if (diceRoll.isFumble) {
					diceTotal.addClass('fumble');
				}
				appendBaseDice(diceTotal, diceRoll.baseRoll);
			});
		}
	});
};

function _buildDiceTotal(roll) {
	return $(`<h4 class="dice-total ${roll.discarded ? 'discarded' : ''}">${roll.totalRoll}</h4>`);
}

const getNaturalRoll = (roll) => {
	const dice = roll.dice[0];
	if (dice) {
		const naturalDice = dice.results.find((dice) => dice.active);
		const diff = roll.total - naturalDice.result;
		return {
			isD20: !!roll.validD20Roll,
			diceRolls: dice.results.map((res) => ({
				isCritical: dice.options.critical === res.result,
				isFumble: dice.options.fumble === res.result,
				baseRoll: res.result,
				totalRoll: res.result + diff,
				discarded: res.discarded
			}))
		};
	} else {
		return {
			isD20: false,
			diceRolls: []
		};
	}
};

const appendBaseDice = (diceTotal, number) => {
	const diceValue = number ? number.toString() : '-';
	const baseDice = $('<span></span>').addClass('base-dice').html(diceValue);
	diceTotal.append(baseDice);
};

export const addMidiStructureStyles = (chatMessage, html) => {
	const midiResults = html.find('.midi-results');
	if (midiResults.find('.midi-qol-saves-display').children(':not(.end-midi-qol-saves-display)').length > 0) {
		midiResults.find('.midi-qol-saves-display').addClass('has-save');
	}

	if (midiResults.find('.midi-qol-damage-roll').children('.midi-damage-roll').length > 0) {
		midiResults.find('.midi-qol-damage-roll').addClass('has-damage');
	}

	if (midiResults.find('.midi-qol-other-damage-roll').children('.midi-damage-roll').length > 0) {
		midiResults.find('.midi-qol-other-damage-roll').addClass('has-other-damage');
	}

	if (midiResults.find('.midi-qol-bonus-damage-roll').children('.midi-damage-roll').length > 0) {
		midiResults.find('.midi-qol-bonus-damage-roll').addClass('has-bonus-damage');
	}

	if (midiResults.find('.midi-attack-roll').length > 0) {
		midiResults.find('.midi-qol-attack-roll').addClass('has-attack');
	}
};
