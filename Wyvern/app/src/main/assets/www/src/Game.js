Wyvern.Game = function(game) {};
Wyvern.Game.prototype = {
	create: function() {
		this.add.sprite(0, 0, 'screen-bg');
		this.add.sprite((Wyvern._WIDTH-28)*0.5, (Wyvern._HEIGHT-36)*0.5, 'sprite');
	},
	update: function() {
	},
};
