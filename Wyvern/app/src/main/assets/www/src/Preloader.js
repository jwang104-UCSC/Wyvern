var Preloader = {
	preload: function()
	{	
		preloadBar = game.add.sprite(game.world.centerX,game.world.centerY,'preloaderBar');
		preloadBar.anchor.setTo(0.5,0.5);
		game.load.setPreloadSprite(preloadBar);

		game.load.image('title', 'img/title.png');
		game.load.image('screen-bg', 'img/screen-bg.png');
		game.load.image('screen-mainmenu', 'img/screen-mainmenu.png');
		game.load.image('screen-howtoplay', 'img/screen-howtoplay.png');
		game.load.image('sprite', 'img/hi.png');
		game.load.image('bullet', 'img/bullet.png');

		game.load.spritesheet('button-start', 'img/button-start.png', 146, 51);
	},
	create: function()
	{
		game.state.start("MainMenu");
	}
}