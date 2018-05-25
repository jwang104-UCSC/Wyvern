var Shop = 
{
	create: function()
	{
		game.add.sprite(0, 0, 'screen-bg');
		startButton   = createButton("Start Game", 15, game.world.width*0.5, game.world.height*0.5, 
						80, 30, function(){game.state.start('Howto')});
		upgradeLives  = createButton("Lives", 15, game.world.width*0.5, game.world.height*0.7, 
						80, 30, function(){Shop.livesPlus()});
		upgradeSpread = createButton("Spread", 15, game.world.width*0.5, game.world.height*0.9, 
						80, 30, function(){Shop.spreadPlus()});
	},

	//Copy paste upgrade functions
	livesPlus: function()
	{
		lives++;
		game.state.start('Game');
	},

	spreadPlus: function()
	{
		shotSpread++;
		game.state.start('Game');
	}
}