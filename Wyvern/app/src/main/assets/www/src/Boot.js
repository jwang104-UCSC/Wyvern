var Wyvern = {
	_WIDTH: 200,
	_HEIGHT: 320
};

Wyvern.Boot = function(game) {};
Wyvern.Boot.prototype = {
	preload: function() {
		this.load.image('preloaderBar', 'img/loading-bar.png');
	},
	create: function() {
		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.pageAlignHorizontally = true;
		this.game.scale.pageAlignVertically = true;
		this.game.state.start('Preloader');
	}
};