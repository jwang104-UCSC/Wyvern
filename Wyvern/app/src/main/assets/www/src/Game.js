Wyvern.Game = function(game) {};
Wyvern.Game.prototype = {
	create: function() {
		this.add.sprite(0, 0, 'screen-bg');
		sprite = this.add.sprite((Wyvern._WIDTH-28)*0.5, (Wyvern._HEIGHT-36)*0.5, 'sprite');
		sprite.inputEnabled = true;
		sprite.input.enableDrag(true);
		// this.game.vjoy = this.game.plugins.add(Phaser.Plugin.VJoy);
		// this.game.vjoy.inputEnable(0, 0, 200, 320);
	},
	update: function() {
	},
};
