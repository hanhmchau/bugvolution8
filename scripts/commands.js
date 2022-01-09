export default class Commands {
	static init(chatCommands) {
		this.addInjuryLinkCommand(chatCommands);
	}

	static addInjuryLinkCommand(chatCommands) {
		chatCommands.registerCommand(
			chatCommands.createCommandFromData({
				commandKey: '/injury',
				invokeOnCommand: (chatlog, messageText, chatdata) => {
					const content = this._buildSimpleMessage('/injury', 'https://monarchsfactory.wordpress.com/2021/09/29/major-injuries-update/');
					ChatMessage.create({ content });
				},
				shouldDisplayToChat: false,
				iconClass: 'fa-user-injured',
				description: 'Link to Major Injury table',
				gmOnly: false
			})
		);
	}

	static _buildSimpleMessage(command, content) {
		return `<span>${content}</span><p class="message-subtext">Invoked by command <b>${command}</b></p>`;
	}
}
