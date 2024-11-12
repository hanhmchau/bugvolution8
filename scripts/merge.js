import { ModuleOptions, ModuleSettings } from './settings.js';
import { arrayEquals } from './utils.js';

export default class Merger {
	static isContinuation(chatMessage) {
		if (this.isValidGroupableType(chatMessage)) {
			const previousMessage = this.loadPreviousMessage(chatMessage);
			if (previousMessage) {
				return this.isContinuationFromPreviousMessage(previousMessage, chatMessage);
			}
		}
	}

	/**
	 * Returns a message is a valid groupable type
	 * @param {*} chatMessage
	 */
	static isValidGroupableType(chatMessage) {
		const isOOC = chatMessage.style === CONST.CHAT_MESSAGE_STYLES.OOC;
		const isIC = chatMessage.style === CONST.CHAT_MESSAGE_STYLES.IC;
		const isOther = chatMessage.style === CONST.CHAT_MESSAGE_STYLES.OTHER;
		const isRoll = chatMessage.rolls && chatMessage.rolls.length;
		const hasItem = !!chatMessage.getAssociatedItem();
		return (isOOC || isIC || isOther) && !(isRoll || hasItem) && chatMessage.speaker.alias !== '#CGMP_DESCRIPTION'; // to play nice with Cautious Gamemaster's Pack's /desc command
	}

	/**
	 * Returns whether the next message is the continuation of the previous message
	 * i.e. the two messages are both from the same actor, are both the same type of groupable messges, have the same recipients
	 * @param {*} prevMessage
	 * @param {*} nextMessage
	 */
	static isContinuationFromPreviousMessage(prevMessage, nextMessage) {
		const isTheSameGroupableType = prevMessage.style === nextMessage.style; // nextMessage.type is already confirmed to be groupable
		const isFromTheSameActor = this.isFromTheSameActor(prevMessage, nextMessage);
		const sameWhisperRecipients = this.sameWhisperRecipients(prevMessage, nextMessage);

		const timeLimit = parseInt(ModuleSettings.getSetting(ModuleOptions.MAXIMUM_TIME_BETWEEN_MERGE));
		const isWithinTimeLimit = this.isWithinTimeLimit(prevMessage, nextMessage, timeLimit);
		return isFromTheSameActor && sameWhisperRecipients && isTheSameGroupableType && isWithinTimeLimit;
	}

	/**
	 * Returns whether two speakers are the same.
	 * @param {*} prevMessage
	 * @param {*} nextMessage
	 */
	static isFromTheSameActor(prevMessage, nextMessage) {
		const prevSpeaker = prevMessage.speaker;
		const nextSpeaker = nextMessage.speaker;

		const isWhisper = nextMessage.whisper.length > 0;
		const isOOC = nextMessage.style === CONST.CHAT_MESSAGE_STYLES.OOC;
		const isOther = nextMessage.style === CONST.CHAT_MESSAGE_STYLES.OTHER;

		if (prevSpeaker.token || nextSpeaker.token) {
			return prevSpeaker.token === nextSpeaker.token;
		}
		if (prevSpeaker.actor || nextSpeaker.actor) {
			return prevSpeaker.actor === nextSpeaker.actor;
		}
		if (isWhisper || isOOC || isOther) {
			return prevMessage.author.id === nextMessage.author.id;
		}
		return false;
	}

	/**
	 * Returns whether two messages have the same whisper recipients
	 * Note: Two public messages will return true (both have no whisper recipients)
	 * @param {*} prevMessage
	 * @param {*} nextMessage
	 */
	static sameWhisperRecipients(prevMessage, nextMessage) {
		if (!prevMessage.whisper || !nextMessage.whisper) {
			return false;
		}

		return arrayEquals(prevMessage.whisper, nextMessage.whisper);
	}

	/**
	 * Returns whether two messages is within a certain amount of time of each other
	 * @param {*} prevMessage
	 * @param {*} nextMessage
	 */
	static isWithinTimeLimit(prevMessage, nextMessage, minutes) {
		return (nextMessage.timestamp - prevMessage.timestamp) / 1000 < minutes * 60;
	}

	/**
	 * Load the previous message of a message
	 * @param {*} messageData
	 */
	static loadPreviousMessage(chatMessage) {
		const messages = game.messages.contents;
		let index = messages.indexOf(chatMessage);
		while (index - 1 >= 0) {
			if (messages[index - 1].visible) {
				return messages[index - 1];
			}
			index--;
		}
	}
}
