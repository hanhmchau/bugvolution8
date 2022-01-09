export default class AutoscrollCombatTracker {
	static init() {
		libWrapper.register(
			'bugvolution8',
			'CombatTracker.prototype.scrollToTurn',
			async function (wrapped, ...args) {
				wrapped(...args);
				if (!this.popOut) {
					ui.combat._popout?.scrollToTurn();
				}
			},
			'WRAPPER'
		);

		CombatTrackerHooks.attach();
	}
}

class CombatTrackerHooks {
	static attach() {
		Hooks.on('createCombat', () => {
			ui.combat.createPopout().render(true);
		});
		Hooks.on('deleteCombat', () => {
			ui.combat._popout?.close();
		});
	}
}
