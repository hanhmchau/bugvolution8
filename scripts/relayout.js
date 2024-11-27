import { ModuleOptions, ModuleSettings } from './settings.js';

export default class Relayouter {
	static relayout(chatMessage, html) {
		if (!html.hasClass('roll-card')) {
			html.children().wrapAll("<div class='right-content'></div>");

			const avatar = $(`<div class="left-avatar"><img src="${this.getAvatar(chatMessage)}"></div>`);
			html.prepend(avatar);

			const timestamp = html.find('.message-timestamp');
			const originator = this.buildSender(chatMessage);
			const flavor = this.buildFlavor(chatMessage);

			const content = html.find('.right-content');
			$(content).prepend(flavor);
			$(content).prepend(originator);
			$(content).prepend(timestamp);
		}
	}

	static getAvatar(chatMessage) {
		const actor = chatMessage.getAssociatedActor();
		const user = chatMessage.user;

		return actor?.img || user.avatar || 'icons/svg/mystery-man.svg';
	}

	static buildSender(chatMessage) {
		const { speaker, whispers } = this.getSender(chatMessage);
		return $(`<span class="message-originator">${speaker}<span class="message-whisper-targets">${this._formatWhisper(whispers)}</span>:</span>`);
	}

	static buildFlavor(chatMessage) {
		if (chatMessage.flavor) {
			return $(`<div class="message-flavor">${chatMessage.flavor}</div>`);
		}
	}

	static getSender(chatMessage) {
		const speaker = chatMessage.alias;
		const whispers = chatMessage.whisper.map(this._getUserName).filter((name) => name);

		return {
			speaker,
			whispers
		};
	}

	static _getUserName(userId) {
		if (userId !== game.user.id) {
			const user = game.users.get(userId);
			if (user) {
				return user.character?.name ?? user.name;
			}
		}
	}

	static _formatWhisper = (names) => (names.length ? ` (To ${names.join(', ')})` : '');
}
