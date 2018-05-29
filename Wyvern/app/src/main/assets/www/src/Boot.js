 var Boot = 
{
	preload: function()
	{
		game.load.image('preloaderBar', 'img/loading-bar.png');
	},
	create: function()
	{
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
		game.state.start('Preloader');
	}
};