export default class AbstractMessage {
	loadPlayerForToken(token) {
		return game.users.get(token);
	}
	/**
	 * Load the appropriate actor for a given message, leveraging token or actor or actor search.
	 * @param {*} speaker
	 */
	loadActorForChatMessage(messageData) {
		const speaker = messageData.speaker;
		if (speaker.token) {
			const possibleToken = game.actors.tokens[speaker.token];
			if (possibleToken) return possibleToken;
		}
		if (speaker.actor) {
			const possibleActor = game.actors.get(speaker.actor);
			if (possibleActor) return possibleActor;
		}
		if (speaker.alias && !speaker.actor) {
			return; // /as command
		}
		game.actors.forEach((value) => {
			if (value.name === speaker.alias) {
				return value;
			}
		});
	}

	/**
	 * @param {*} actor
	 */
	getChatTokenImage(actor) {
		if (actor) return actor.token ? actor.token.data.img : actor.data.token.img;
		return '';
	}

	/**
	 * @param {*} userId
	 * @param {*} message
	 */
	getUserImage(userId) {
		const user = game.users.get(userId);
		if (user) {
			return user.avatar;
		}
		return '';
	}

	getWhisperTargets(names, speaker) {
		if (typeof names === 'string' && names.trim().length === 0) {
			return '';
		}
		if (typeof names === 'string' && names !== speaker) {
			return names;
		}
		if (names && names.join) {
			const validNames = names.filter((name) => name !== speaker);
			if (validNames.length === 0) return '';
			const namesString = validNames.join(', ');
			return namesString;
		}
		return '';
	}

	_addClass = (html, className) => {
		html.addClass(className);
	};

	_warn = (content) => {
		console.warn(`MESSAGE GROUPING | ${content}`);
	};
}
