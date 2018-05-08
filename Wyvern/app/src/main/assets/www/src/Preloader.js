var Preloader = {
	preload: function()
	{	
		console.log("this is working?");
		preloadBar = game.add.sprite(game.world.centerX,game.world.centerY,'preloaderBar');
		preloadBar.anchor.setTo(0.5,0.5);
		game.load.setPreloadSprite(preloadBar);

		game.load.image('title', 'img/title.png');
		game.load.image('screen-bg', 'img/screen-bg.png');
		game.load.image('screen-mainmenu', 'img/screen-mainmenu.png');
		game.load.image('screen-howtoplay', 'img/screen-howtoplay.png');
		game.load.image('sprite', 'img/hi.png');
		game.load.image('bullet', 'img/hi.png');

		game.load.spritesheet('button-start', 'img/button-start.png', 146, 51);
	},
	create: function()
	{
		console.log("hey this worked");
		game.state.start("Game");
	}
}

// Wyvern.Preloader = function(game) {};
// Wyvern.Preloader.prototype = {
// 	preload: function() {
// 		this.preloadBar = this.add.sprite((Wyvern._WIDTH-125)*0.5, (Wyvern._HEIGHT-21)*0.5, 'preloaderBar');
// 		this.load.setPreloadSprite(this.preloadBar);

// 		this.load.image('title', 'img/title.png');
// 		this.load.image('screen-bg', 'img/screen-bg.png');
// 		this.load.image('screen-mainmenu', 'img/screen-mainmenu.png');
// 		this.load.image('screen-howtoplay', 'img/screen-howtoplay.png');
// 		this.load.image('sprite', 'img/hi.png');
// 		this.load.image('bullet', 'img/hi.png');

// 		this.load.spritesheet('button-start', 'img/button-start.png', 146, 51);
// 	},
// 	create: function() {
// 		this.game.state.start('Game');
// 	}
// };