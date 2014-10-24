var Action = new Backbone.Marionette.Application();

Action.uri = 'https://graph.api.smartthings.com/api/smartapps/installations/ca03bd75-ea33-4e62-a6e0-247191657c5f/';
Action.access_token = 'b89cb33c-e0fc-4723-b334-4978332e2ee9';

Action.Device = Backbone.Model.extend({
	initialize: function() {
		this.set('id', this.get('type') + '_' + this.get('id'));
	}
});
Action.Devices = Backbone.Collection.extend({
	model: Action.Device,
});

Action.DeviceTypes = Backbone.Collection.extend({
	initialize: function() {
		this.listenTo(this, 'add', function(model) {
			Action.devices.add(model);
		});

		this.listenTo(this, 'remove', function(model) {
			Action.devices.remove(model);
		});
	}
});

Action.Contact = Action.Device.extend();
Action.Contacts = Action.DeviceTypes.extend({
	model: Action.Contact,
});

Action.Dimmer = Action.Device.extend();
Action.Dimmers = Action.DeviceTypes.extend({
	model: Action.Dimmer,
});

Action.Humidity = Action.Device.extend();
Action.Humidities = Action.DeviceTypes.extend({
	model: Action.Humidity,
});

Action.Lock = Action.Device.extend();
Action.Locks = Action.DeviceTypes.extend({
	model: Action.Lock,
});

Action.Link = Action.Device.extend();
Action.Links = Action.DeviceTypes.extend({
	model: Action.Link,
});

Action.Momentary = Action.Device.extend();
Action.Momentaries = Action.DeviceTypes.extend({
	model: Action.Momentary,
});

Action.Motion = Action.Device.extend();
Action.Motions = Action.DeviceTypes.extend({
	model: Action.Motion,
});

Action.Presence = Action.Device.extend();
Action.Presences = Action.DeviceTypes.extend({
	model: Action.Presence,
});

Action.Switch = Action.Device.extend();
Action.Switches = Action.DeviceTypes.extend({
	model: Action.Switch,
});

Action.Temperature = Action.Device.extend();
Action.Temperatures = Action.DeviceTypes.extend({
	model: Action.Temperature,
});

Action.Weather = Action.Device.extend({

});

Action.DeviceView = Marionette.ItemView.extend({
	className: function() {
		return 'st-tile ' + this.model.get('type');
	},
	getTemplate: function() {
		var template = '#_st-' + this.model.get('type');
		if ($(template).length === 0) {
			template = '#_st-device';
		}

		return template;
	},
	bindings: {
		'.st-title': 'name',
		'.fa': {
			observe: 'status',
			update: 'getIcon',
		},
	},
	icons: {},

	onRender: function() {
		this.stickit();
		this.$el.enhanceWithin();
	},

	getIcon: function($el, val, model) {
		_.each(this.icons, function(icon, key) {
			$el.toggleClass(icon, key == val);
		});
	},
});

Action.ContactView = Action.DeviceView.extend({
	icons: {
		'closed': 'fa-compress',
		'open': 'fa-expand',
	},
});

Action.SwitchView = Action.DeviceView.extend({
	icons: {
		'off': 'fa-toggle-off',
		'on': 'fa-toggle-on',
	},
});

Action.PresenceView = Action.DeviceView.extend({
	icons: {
		'not present': 'fa-map-marker-away',
		'present': 'fa-map-marker',
	},
});

Action.DimmerView = Action.SwitchView.extend();

Action.MotionView = Action.DeviceView.extend({
	icons: {
		'inactive': 'fa-square-o',
		'active': 'fa-square',
	},
});

Action.LockView = Action.DeviceView.extend({
	icons: {
		'unlocked': 'fa-unlock-alt',
		'locked': 'fa-lock',
	},
});

Action.MomentaryView = Action.DeviceView.extend({
	icons: {
		'': 'fa-circle-o',
	},
});

Action.LinkView = Action.DeviceView.extend({
	icons: {
		'': 'fa-circle-o',
	},

	initialize: function() {
		this.bindings = _.extend({}, this.bindings, {
			'a': {
				attributes: [{
					observe: 'status',
					name: 'href',
				}],
			}
		});
	},

});

Action.TemperatureView = Action.DeviceView.extend({
	initialize: function() {
		this.bindings = _.extend({}, this.bindings, {
			'.st-icon': {
				observe: 'status',
				onGet: function(val) {
					return val;
				}
			}
		});
	}
});

Action.HumidityView = Action.TemperatureView.extend();

Action.DevicesView = Marionette.CollectionView.extend({
	getChildView: function(item) {
		if (item instanceof Action.Contact) {
			return Action.ContactView;
		} else if (item instanceof Action.Dimmer) {
			return Action.DimmerView;
		} else if (item instanceof Action.Switch) {
			return Action.SwitchView;
		} else if (item instanceof Action.Motion) {
			return Action.MotionView;
		} else if (item instanceof Action.Temperature) {
			return Action.TemperatureView;
		} else if (item instanceof Action.Humidity) {
			return Action.HumidityView;
		} else if (item instanceof Action.Presence) {
			return Action.PresenceView;
		} else if (item instanceof Action.Lock) {
			return Action.LockView;
		} else if (item instanceof Action.Momentary) {
			return Action.MomentaryView;
		} else if (item instanceof Action.Link) {
			return Action.LinkView;
		}

		return Action.DeviceView;
	},

	initialize: function() {

	},

	onRender: function() {
		this.$el.packery({
			itemSelector: '.st-tile',
			gutter: 10,
		});

		this.listenTo(this, 'childview:show', function(view) {
			this.$el.packery('reloadItems').packery();
		});
	}
});


Action.updateData = function() {
	$.ajax({
		url: Action.dataUri,
		dataType: 'jsonp',
		data: {
			access_token: Action.access_token,
		},
		success: function(data) {
			console.log(data);
			Action.contacts.set(new Action.Contacts(data.contacts).models);
			Action.dimmers.set(new Action.Dimmers(data.dimmers).models);
			Action.humidities.set(new Action.Humidities(data.humidity).models);
			Action.locks.set(new Action.Locks(data.locks).models);
			Action.links.set(new Action.Links(data.links).models);
			Action.momentaries.set(new Action.Momentaries(data.momentary).models);
			Action.motions.set(new Action.Motions(data.motion).models);
			Action.presences.set(new Action.Presences(data.presence).models);
			Action.switches.set(new Action.Switches(data.switches).models);
			Action.temperatures.set(new Action.Temperatures(data.temperature).models);
		},
	});
};

Action.addInitializer(function() {
	Action.devices = new Action.Devices();

	Action.contacts = new Action.Contacts();
	Action.dimmers = new Action.Dimmers();
	Action.humidities = new Action.Humidities();
	Action.locks = new Action.Locks();
	Action.links = new Action.Links();
	Action.momentaries = new Action.Momentaries();
	Action.motions = new Action.Motions();
	Action.presences = new Action.Presences();
	Action.switches = new Action.Switches();
	Action.temperatures = new Action.Temperatures();

	Action.dataUri = Action.uri + 'data';
	Action.updateData();

	Action.addRegions({
		container: '#container',
	});

	Action.container.show(new Action.DevicesView({
		collection: Action.devices
	}));
});

$().ready(function() {
	Action.start();
});