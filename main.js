'use strict';

import InCharacterMessage from './scripts/ic.js';
import { ModuleSettings } from './scripts/settings.js';
import RollIconsModification from './scripts/roll-icons.js';
import DeleteMessage from './scripts/delete.js';
import AutoscrollCombatTracker from './scripts/combat-tracker.js';

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
 * These hooks register the following settings in the module settings.
 */
Hooks.once('init', () => {
	ModuleSettings.registerSettings();
	RollIconsModification.init();
	AutoscrollCombatTracker.init();
	InCharacterMessage.init();
	DeleteMessage.init();
});
