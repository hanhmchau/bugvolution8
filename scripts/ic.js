import RollIconsModification from './roll-icons.js';

export default class InCharacterMessage {
	static init() {
		libWrapper.register(
			'bugvolution8',
			'ChatMessage.prototype.getHTML',
			async function (wrapped, ...args) {
				const html = await wrapped(...args);

				/** Mutate the html here */
				addIsMeClass(this, html);
				RollIconsModification.process(this, html);
				addIsRollCardClass(html);
				/** End mutation */

				return html;
			},
			'WRAPPER'
		);
	}
}

const addIsMeClass = (chatMessage, html) => {
	if (chatMessage.user.id === game.user.id) {
		html.addClass('me');
	}
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
