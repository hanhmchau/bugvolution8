export default class DeleteMessage {
	static init() {
		libWrapper.register(
			'bugvolution8',
			'ChatLog.prototype._getEntryContextOptions',
			function (wrapped, ...args) {
				const options = wrapped(...args);
				const filteredOptions = DeleteMessageHelper.removeExistingDelete(options);
				return DeleteMessageHelper.appendChatContextMenuOptions(filteredOptions);
			},
			'WRAPPER'
		);
	}
}
class DeleteMessageHelper {
	static removeExistingDelete(options) {
		return options.filter(option => option.name != 'SIDEBAR.Delete');
	}

	static appendChatContextMenuOptions(options) {
		return [...options, {
			name: 'Delete',
			icon: '<i class="fas fa-trash danger"></i>',
			condition: (li) => {
				const message = game.messages.get(li.data('messageId'));
				return game.user.isGM || message.isAuthor;
			},
			callback: (header) => this._previewDelete(header)
		}];
	}

	static _previewDelete(header) {
		const chatData = ui.chat.collection.get($(header).attr('data-message-id'));
		const element = $(header[0]).clone().removeClass('continued').addClass('leading');
		new Dialog({
			title: `Delete Message`,
			content: `
				<div id="preview-delete-dialog">
					<h4 class="dialog-prompt">Are you sure you want to delete this message?</h4>
					<div id="chat-log" 
					class="preview-delete">
					${$(element)[0].outerHTML}
					</div> 
				</div>
			   `,
			buttons: {
				deletemsg: {
					label: `Delete`,
					callback: () => chatData.delete()
				},
				cancel: {
					label: 'Cancel'
				}
			}
		}).render(true);
	}
}
