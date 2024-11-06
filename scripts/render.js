import { MODULE_NAME } from './const.js';

export default class RenderUtility {
	/**
	 * Renders a module template for the specified render type.
	 * @param {TEMPLATE} template The requested template to render.
	 * @param {Object} data Field metadata for rendering.
	 * @returns {Promise<String>} The rendered html data for the field.
	 */
	static render(template, data = {}) {
		return renderTemplate(`modules/${MODULE_NAME}/templates/${template}`, data);
	}
}
