import { MODULE_NAME } from './const.js';

const appendRetroCrit = (chatMessage, html) => {
	setTimeout(() => {
		const damageTotal = html.find(':is(.midi-damage-roll,.midi-qol-other-damage-roll) .dice-total').first();

		const critButton = $('<button>CRIT</button>');
		critButton.on('click', async function (event) {
			event.stopPropagation();
			const item = chatMessage.getAssociatedItem();
			if (item) {
				await forceCrit(chatMessage);
				const midi = chatMessage.flags['midi-qol'];

				midi.damageDetail = MidiQOL.createDamageDetail({ roll: chatMessage.rolls, item });
				midi.roll = chatMessage.rolls;
				midi.damageTotal = midi.damageDetail.map((det) => det.value).reduce((acc, cur) => acc + cur, 0);

				chatMessage.update({
					content: chatMessage.content,
					flags: chatMessage.flags
				});
			}
		});
		damageTotal.append(critButton);
	}, 200);
};

const replaceHTML = (oldContent, damageDetail) => {
	const html = $($.parseHTML(oldContent)[0]);
	html.find('.midi-damage-roll');
};

/**
 * Updates a given chat message, saving changes to the database.
 * @param {ChatMessage} message The chat message to update.
 * @param {Object} update The object data for the message update.
 */
const updateChatMessage = async (message, update = {}, context = {}) => {
	if (message instanceof ChatMessage) {
		await message.update(update, context);
	}
};

const forceCrit = async (message) => {
	const actor = message.getAssociatedActor();
	const item = message.getAssociatedItem();

	const rolls = message.rolls.filter((r) => r instanceof CONFIG.Dice.DamageRoll);
	const crits = (await mapToCrits(actor, rolls)).map((crit, index) => mergeCrit(crit, rolls[index]));

	const midi = message.flags['midi-qol'];

	rolls.forEach((roll, index) => {
		const ogIndex = message.rolls.indexOf(roll);
		message.rolls[ogIndex] = crits[index];
	});

	console.warn(midi.roll);
};

const mapToCrits = (actor, rolls) => {
	return Promise.all(rolls.map(async (roll) => await getCriticalRoll(actor, roll)));
};

const getCriticalRoll = async (actor, existingRoll) => {
	const critRoll = new CONFIG.Dice.DamageRoll(existingRoll.formula, actor, {
		critical: true,
		powerfulCritical: game.settings.get('dnd5e', 'criticalDamageMaxDice'),
		multiplyNumeric: game.settings.get('dnd5e', 'criticalDamageModifiers')
	});
	await critRoll.evaluate();
	return critRoll;
};

const mergeCrit = (critRoll, baseRoll) => {
	for (const [j, term] of baseRoll.terms.entries()) {
		if (!(term instanceof Die)) {
			continue;
		}

		critRoll.terms[j].results.splice(0, term.results.length, ...term.results);
	}
	critRoll._total = critRoll._evaluateTotal();
	critRoll.resetFormula();

	return critRoll;
};
