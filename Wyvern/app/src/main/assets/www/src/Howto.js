var Howto = 
{
	create: function(){
		buttonContinue = game.add.button(0, 0, 'screen-howtoplay', function(){game.state.start('Game')}, this);
	}
}