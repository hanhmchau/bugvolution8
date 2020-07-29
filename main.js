"use strict";

import InCharacterMessage from "./scripts/ic.js";
import MarkdownMessage from "./scripts/markdown.js";
import EmoteMessage from "./scripts/emote.js";
import { ModuleSettings, ModuleOptions } from "./scripts/settings.js";
import AutoscrollCombatTracker from "./scripts/combat-tracker.js";

/**
 * Valid Foundry.js chat message type
 *
 * const CHAT_MESSAGE_TYPES = {
 *  OTHER: 0,
 *  OOC: 1,
 *  IC: 2,
 *  EMOTE: 3,
 *  WHISPER: 4,
 *  ROLL: 5
 *};
 */

/**
 * Main class wrapper for all of our features.
 */
class ChatMessageStyler {
	static onRenderChatLog(chatLog, html, data) {
		$(html).addClass('bugvolution-chat-log');
	}
	static onRenderChatMessage(chatMessage, html, messageData) {
		if (ModuleSettings.getSetting(ModuleOptions.MARKDOWN)) {
			MarkdownMessage.process(chatMessage, html, messageData);
		}
		InCharacterMessage.process(chatMessage, html, messageData);
		EmoteMessage.process(chatMessage, html, messageData);
	}
	static onCreateChatMessage() {
		setTimeout(() => {
			ui.chat.scrollBottom();
		}, 10);
	}
}

/**
 * These hooks register the following settings in the module settings.
 */
Hooks.once("init", () => {
	InCharacterMessage.init();
	ModuleSettings.registerSettings();
	CONFIG.ui.combat = AutoscrollCombatTracker;
});

/**
 * This line connects our method above with the chat rendering.
 * Note that this happens after the core code has already generated HTML.
 */
Hooks.on("renderChatMessage", ChatMessageStyler.onRenderChatMessage.bind(ChatMessageStyler));
Hooks.on("renderChatLog", ChatMessageStyler.onRenderChatLog.bind(ChatMessageStyler));
Hooks.on("createChatMessage", ChatMessageStyler.onCreateChatMessage.bind(ChatMessageStyler));

class ChatMessageContextMenu {
	static onGetEntryContext(html, entryOptions) {
		console.log(entryOptions);
	}
}

Hooks.on("getChatLogEntryContext", ChatMessageContextMenu.onGetEntryContext.bind(ChatMessageContextMenu));

// DEPRECATED as Foundry 0.6.5 supports /me as well as /em
// Hooks.on("preCreateChatMessage", EmoteMessage.resolveMeCommand.bind(EmoteMessage));

Hooks.on('renderCombatTracker', (...args) => {
	Hooks.call('renderSidebarTab', ...args);
});