import AbstractMessage from './message.js';
import RollIconsModification from './roll-icons.js';
import { ModuleOptions, ModuleSettings } from './settings.js';
import { arrayEquals } from './utils.js';

const TEMPLATES = {
	CHAT_MESSAGE: 'modules/bugvolution8/templates/chat_message.hbs'
};

export default class InCharacterMessage {
	static init() {
		loadTemplates([TEMPLATES.CHAT_MESSAGE]);
		libWrapper.register(
			'bugvolution8',
			'ChatMessage.prototype.getHTML',
			async function (wrapped, ...args) {
				const chatMessage = this;
				const html = await wrapped(...args);
				const helper = new InCharacterMessageHelper();
				await helper.process(chatMessage, html);
				return html;
			},
			'WRAPPER'
		);
	}
}
class InCharacterMessageHelper extends AbstractMessage {
	CLASS_NAMES = {
		MODIFIED: 'modified',
		ROLL_UI: 'roll-ui',
		LITE_UI: 'lite-ui',
		LEADING: 'leading', // first message in a group of messages
		CONTINUED: 'continued', // all messages following,
		ROLL: 'roll',
		ME: 'me',
		INVISIBLE: 'none'
	};

	async process(chatMessage, html) {
		// const isLiteMode = false;
		const isLiteMode = ModuleSettings.getSetting(ModuleOptions.LITE_MODE);
		if (isLiteMode) {
			this._addClass(html, this.CLASS_NAMES.LITE_UI);
		} else {
			this._addClass(html, this.CLASS_NAMES.ROLL_UI);
		}
		if (this.isNotSupposedToSee(chatMessage)) {
			console.warn('is not supposed to see!');
			this._addClass(html, this.CLASS_NAMES.INVISIBLE);
		}

		const isDiceRoll = chatMessage.data.type === CONST.CHAT_MESSAGE_TYPES.ROLL;
		const isRollTemplate = this.isDiceRollTemplate(chatMessage, html);
		const isRoll = isRollTemplate || isDiceRoll;
		const isValidGroupableType = this.isValidGroupableType(chatMessage);
		const isMe = this.isMe(chatMessage);

		if (isRoll) {
			this._addClass(html, this.CLASS_NAMES.ROLL);
			this.updateRollIcons(chatMessage, html);
		}
		if (!isLiteMode) {
			await this.updateLayout(chatMessage, html, isRoll);
			$(html).removeAttr('style');
		}

		if (isMe) {
			this._addClass(html, this.CLASS_NAMES.ME);
		}

		let isContinuation = false;
		// ADD CONTINUATION CLASS
		if (!chatMessage.data.forceLeading && isValidGroupableType) {
			const previousMessage = this.loadPreviousMessage(chatMessage);
			if (previousMessage) {
				isContinuation = this.isContinuationFromPreviousMessage(previousMessage, chatMessage);
			}
		}

		if (isContinuation) {
			this._addClass(html, this.CLASS_NAMES.CONTINUED);
		} else {
			this._addClass(html, this.CLASS_NAMES.LEADING);
		}
	}

	async updateLayout(chatMessage, html, isRoll) {
		const isWhisper = chatMessage.data.type === CONST.CHAT_MESSAGE_TYPES.WHISPER;
		const actor = this.loadActorForChatMessage(chatMessage.data);
		const user = chatMessage.data.user || chatMessage.user.id;
		const avatar = this.getChatTokenImage(actor) || this.getUserImage(user);
		const whisperTo = this.formatWhisper($(html).find('.whisper-to').text());

		let renderData = {
			avatar,
			timestamp: chatMessage.data.timestamp,
			speaker: chatMessage.alias,
			whisperTo,
			isWhisper,
			flavor: chatMessage.data.flavor
		};
		const renderedHTML = await renderTemplate(TEMPLATES.CHAT_MESSAGE, renderData);
		if (!isRoll) {
			const savedMessageContent = $(html).find('.message-content').clone(true);
			$(html).html(renderedHTML);
			$(html).find('.content').append(savedMessageContent);
		} else {
			$(html).find('.message-header').html(renderedHTML).removeClass('message-header');
		}
	}

	/**
	 * Update the roll icon for ability checks and saving throws with an appropriate icon
	 * @param {*} chatMessage
	 * @param {*} html
	 */
	updateRollIcons(chatMessage, html) {
		RollIconsModification.process(chatMessage, html);
	}

	/**
	 * Returns a message is a dice roll template
	 * @param {*} chatMessage
	 * @param {*} html
	 */
	isDiceRollTemplate(chatMessage, html) {
		return $(html).find('.dnd5e.red-full').length > 0;
	}

	/**
	 * Returns a message is a valid groupable type
	 * @param {*} chatMessage
	 */
	isValidGroupableType(chatMessage) {
		const groupableMessageTypes = [CONST.CHAT_MESSAGE_TYPES.OOC, CONST.CHAT_MESSAGE_TYPES.IC, CONST.CHAT_MESSAGE_TYPES.WHISPER, CONST.CHAT_MESSAGE_TYPES.OTHER];
		return groupableMessageTypes.includes(chatMessage.data.type) && chatMessage.data.speaker.alias !== '#CGMP_DESCRIPTION'; // to play nice with Cautious Gamemaster's Pack's /desc command
	}

	/**
	 * Returns whether the next message is the continuation of the previous message
	 * i.e. the two messages are both from the same actor, are both the same type of groupable messges, have the same recipients
	 * @param {*} prevMessage
	 * @param {*} nextMessage
	 */
	isContinuationFromPreviousMessage(prevMessage, nextMessage) {
		const isTheSameGroupableType = prevMessage.data.type === nextMessage.data.type; // nextMessage.type is already confirmed to be groupable
		const isFromTheSameActor = this.isFromTheSameActor(prevMessage.data, nextMessage.data);
		const sameWhisperRecipients = this.sameWhisperRecipients(prevMessage, nextMessage);
		return isFromTheSameActor && sameWhisperRecipients && isTheSameGroupableType;
	}

	/**
	 * Returns whether two speakers are the same.
	 * @param {*} prevMessage
	 * @param {*} nextMessage
	 */
	isFromTheSameActor(prevMessage, nextMessage) {
		const prevSpeaker = prevMessage.speaker;
		const nextSpeaker = nextMessage.speaker;
		const isWhisper = nextMessage.type === CONST.CHAT_MESSAGE_TYPES.WHISPER;
		const isOOC = nextMessage.type === CONST.CHAT_MESSAGE_TYPES.OOC;
		const isOther = nextMessage.type === CONST.CHAT_MESSAGE_TYPES.OTHER;

		if (prevSpeaker.token || nextSpeaker.token) {
			return prevSpeaker.token === nextSpeaker.token;
		}
		if (prevSpeaker.alias || nextSpeaker.alias) {
			return prevSpeaker.alias === nextSpeaker.alias;
		}
		if (isWhisper || isOOC || isOther) {
			return prevMessage.user === nextMessage.user;
		}
		return false;
	}

	/**
	 * Returns whether two messages have the same whisper recipients
	 * Note: Two public messages will return true (both have no whisper recipients)
	 * @param {*} prevMessage
	 * @param {*} nextMessage
	 */
	sameWhisperRecipients(prevMessage, nextMessage) {
		if (!prevMessage.data.whisper || !nextMessage.data.whisper) {
			this._warn('WHISPER PROPERTY OF CHAT MESSAGE NOT FOUND');
			return false;
		}
		const prevRealWhisperTargets = this.getRealWhisperTargets(prevMessage);
		const nextRealWhisperTargets = this.getRealWhisperTargets(nextMessage);
		const hasRealWhisperTargets = prevRealWhisperTargets && nextRealWhisperTargets;

		const prevWhispers = prevMessage.data.whisper;
		const nextWhispers = nextMessage.data.whisper;

		return (hasRealWhisperTargets ? arrayEquals(prevRealWhisperTargets, nextRealWhisperTargets) : true) && arrayEquals(prevWhispers, nextWhispers);
	}

	/**
	 * Load the previous message of a message
	 * @param {*} messageData
	 */
	loadPreviousMessage(chatMessage) {
		const messages = game.messages.contents;
		let index = messages.indexOf(chatMessage);
		while (index - 1 >= 0) {
			if (messages[index - 1].visible) {
				return messages[index - 1];
			}
			index--;
		}
	}

	/**
	 * Returns whether the message is from the current player
	 * @param {*} chatMessage
	 */
	isMe(chatMessage) {
		return chatMessage.data.user === game.user.id;
	}

	getRealWhisperTargets(chatMessage) {
		try {
			return chatMessage.getFlag('bugwhisper', 'whisperTargets');
		} catch (e) {
			return [];
		}
	}

	formatWhisper = (string) => (string ? ` (${string})` : '');

	isNotSupposedToSee(chatMessage) {
		const isAuthor = chatMessage.isAuthor;
		const whisperTargets = chatMessage.data.whisper;
		const isWhisper = whisperTargets.length > 0;
		return isWhisper && !isAuthor && !whisperTargets.includes(game.user.id);
	}
}
