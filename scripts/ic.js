import addDamageApplyButtons from './apply-dmg-buttons.js';
import Merger from './merge.js';
import Relayouter from './relayout.js';
import { addIsRollCardClass, addMidiStructureStyles, addNaturalRollClass } from './roll-card.js';
import RollIconsModification from './roll-icons.js';
import { ModuleOptions, ModuleSettings } from './settings.js';

export default class InCharacterMessage {
	static init() {
		applyCurrentFontSize();
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
				addMidiStructureStyles(this, html);
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

export const changeFontSize = (fontSize) => {
	$(':is(#chat-popout,#chat-log,#chat-results) :is(.message,.chat-message)').css('font-size', `${fontSize}px`);
};

export const applyCurrentFontSize = () => {
	const fontSize = parseInt(ModuleSettings.getSetting(ModuleOptions.FONT_SIZE));
	changeFontSize(fontSize);
};
