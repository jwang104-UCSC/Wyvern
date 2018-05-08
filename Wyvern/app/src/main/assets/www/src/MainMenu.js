var MainMenu = 
{
	create: function(){
		game.add.sprite(0, 0, 'screen-mainmenu');
		gameTitle = game.add.sprite(game.world.width*0.5, game.world.height*0.1, 'title');
		gameTitle.anchor.set(0.5,0);
		startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button-start', 
			function(){game.state.start('Howto')}, this, 2, 0, 1);
		startButton.anchor.set(0.5,0);
	}
}