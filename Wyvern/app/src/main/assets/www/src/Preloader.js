var Preloader = {
	preload: function()
	{
		preloadBar = game.add.sprite(game.world.centerX,game.world.centerY,'preloaderBar');
		preloadBar.anchor.setTo(0.5,0.5);
		game.load.setPreloadSprite(preloadBar);

		game.load.image('mainMenu-bg', 'img/mainMenu-bg.png')
		game.load.image('screen-bg', 'img/screen-bg.png');
		game.load.image('shop-bg', 'img/shop-bg.jpg');
		game.load.image('screen-howtoplay', 'img/screen-howtoplay.png');
		//game.load.image('redsky', 'img/redsky.jpg');
		game.load.image('redsky', 'img/redskyloop.png');
		game.load.image('pauseScreen', 'img/pause-screen.png');

		game.load.image('shield', 'img/shield36x36-2.png');
		game.load.image('bomb', 'img/bomb36x36.png');
		game.load.image('watch', 'img/watch36x36.png');
		
		game.load.image('bombboom', 'img/redring.png');

		game.load.image('invuln', 'img/invuln2.png');
		//game.load.image('enemy', 'img/bat.png');
		game.load.image('bullet', 'img/bullet.png');
		game.load.image('dragon', 'img/dragon.png');
		game.load.image('fireball', 'img/fireball.png');
		game.load.image('dorito', 'img/doritos.png');
		game.load.spritesheet('explode', 'img/explode.png', 128, 128);
		game.load.spritesheet('eyes', 'img/eyes35x32.png', 35, 32, 16);
		game.load.spritesheet('letters', 'img/letters-white.png', 9, 8, 26);
		game.load.spritesheet('numbers', 'img/numbers-white.png', 9, 8, 12);
		game.load.spritesheet('meteor', 'img/meteorite-fixed.png', 32, 32, 30);
		
		game.load.bitmapFont('buttonStyle', 'img/carrier_command.png', 'img/carrier_command.xml');
		game.load.bitmapFont('titleFont', 'img/desyrel.png', 'img/desyrel.xml');
		game.load.bitmapFont('xsa', 'img/shortStack.png', 'img/shortStack.xml');


		game.load.audio('buttonSFX', 'sfx/sword.mp3');
		game.load.audio('cosmosBGM', 'sfx/Metal Slug 3 - Into the Cosmos.ogg');
		game.load.audio('warudoSFX', 'sfx/Za Warudo.mp3');
		game.load.audio('warudoEndSFX', 'sfx/Warudo End.ogg');
		game.load.audio('clockTick', 'sfx/clockTick.ogg');
		game.load.audio('hit', 'sfx/384 hit.wav');
		game.load.audio('death', 'sfx/383 death.wav');
		game.load.audio('rockhit', 'sfx/355 hit.wav');
		game.load.audio('rockdeath', 'sfx/354 death.wav');
		

		game.load.audio('explodes', 'sfx/063 explode.wav');
		game.load.audio('explodes2', 'sfx/explosion.mp3');
		

		//game.load.spritesheet('eyes', 'img/metalslug_monster39x40.png', 39, 40);
		game.load.image('pauseBtn', 'img/pause.png');
		//game.load.spritesheet('button-start', 'img/button-start.png', 146, 51);
		game.load.spritesheet('button', 'img/flixel-button.png', 80, 20);
	},
	create: function()
	{
		game.add.plugin(PhaserInput.Plugin);
		//loads right into the game because I'm tired of clicking the menu away
		game.state.start("Game");
		//game.state.start("Shop");
		//game.state.start("MainMenu");
	}
}