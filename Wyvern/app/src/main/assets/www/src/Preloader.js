Wyvern.Preloader = function(game) {};
Wyvern.Preloader.prototype = {
	preload: function() {
		this.preloadBar = this.add.sprite((Wyvern._WIDTH-125)*0.5, (Wyvern._HEIGHT-21)*0.5, 'preloaderBar');
		this.load.setPreloadSprite(this.preloadBar);

		this.load.image('title', 'img/title.png');
		this.load.image('screen-bg', 'img/screen-bg.png');
		this.load.image('screen-mainmenu', 'img/screen-mainmenu.png');
		this.load.image('screen-howtoplay', 'img/screen-howtoplay.png');
		this.load.image('sprite', 'img/hi.png');
		

		this.load.spritesheet('button-start', 'img/button-start.png', 146, 51);
	},
	create: function() {
		this.game.state.start('MainMenu');
	}
};