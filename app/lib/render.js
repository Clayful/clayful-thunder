const mergeWith = require('lodash.mergeWith');
const omit = require('lodash.omit');
const Pikaday = require('pikaday');

// Track component IDs
const componentIds = {};

module.exports = function(selector, componentName, options, callback) {

	const Thunder = this;

	options = options || {};
	callback = typeof options === 'function' ? options : callback;

	// Increment component counter
	componentIds[componentName] = componentIds[componentName] || 0;

	const id = componentIds[componentName]++;

	const container = (selector instanceof $) ? selector : $(selector);
	const component = this.components[componentName];

	// Template context
	const context = {
		id: `${componentName}-${id}`
	};

	// Add 'thunder--contents' class for global css styles
	container.addClass('thunder--contents');

	// Unbind all event handlers
	container.off();
	container.find('*').off();
	container.find('[data-mh]').matchHeight({ remove: true });
	container.find('[data-pickaday]').each(function() {

		const picker = $(this).data('pickaday');

		return picker ? picker.destroy() : null;

	});

	// Start loading spinner
	container.html(this.uis['component-spinner']());

	// Copy and extend default options with runtime options
	mergeWith(
		context,
		{   // Global context
			isAuthenticated: !!Thunder.authenticated(), // Customer is authenticated?
		},
		this.templateMethods, // Template methods
		{   // Translation method
			m: (key, context) => Thunder.polyglot.t(`${ componentName }.${ key }`, context),
			ui: Thunder.uis,
		},
		{ options: component.options() },
		{ options: component.default },
		{ options: omit(container.data(), ['component', 'context']) }, // Declarative options
		{ options: options }, // Explicit options
		(ov, sv) => {
			if (Array.isArray(ov) && Array.isArray(sv)) {
				return sv;
			}
		}
	);

	if (component.validate) {

		const err = component.validate(context.options);

		if (err) {
			return this.util.log(['error'], component.name + ' - ' + err);
		}

	}

	component.pre.call(container, context, (function(err, context) {

		if (err) {
			return;
		}

		// Cache component
		container.data('component', Thunder.components[componentName]);

		// Cache context data
		container.data('context', context);

		container.html(component.template(context));

		Thunder.trigger('componentRender', container, componentName, container, context);

		Thunder.util.quantityInput(container);

		// Bind before automatic binding
		if (component.bind) {
			component.bind.call(container, context);
		}

		container.imagesLoaded(() => container.find('[data-mh]').matchHeight());

		const t = key => Thunder.polyglot.t(`general.${key}`);

		container.find('[data-pickaday]').each(function() {

			$(this).data('pickaday', new Pikaday($.extend($(this).data(), {
				field:  $(this)[0],
				format: Thunder.options.dateInputFormat,
				i18n: {
					previousMonth: t('previousMonth'),
					nextMonth:     t('nextMonth'),
					months:        [
						t('january'),
						t('february'),
						t('march'),
						t('april'),
						t('may'),
						t('june'),
						t('july'),
						t('august'),
						t('september'),
						t('october'),
						t('november'),
						t('december'),
					],
					weekdays:      [
						t('sunday'),
						t('monday'),
						t('tuesday'),
						t('wednesday'),
						t('thursday'),
						t('friday'),
						t('saturday'),
					],
					weekdaysShort: [
						t('sundayShort'),
						t('mondayShort'),
						t('tuesdayShort'),
						t('wednesdayShort'),
						t('thursdayShort'),
						t('fridayShort'),
						t('saturdayShort'),
					]
				}
			})));

		});

		const interfaces = component.init.call(container, context) || {};

		Thunder.trigger('componentInit', container, componentName, container, context);

		return callback && callback.call($(this), err, { interfaces, context });

	}).bind(container));

	return this;

};