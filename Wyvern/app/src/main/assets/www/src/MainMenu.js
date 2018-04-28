Wyvern.MainMenu = function(game) {};
Wyvern.MainMenu.prototype = {

	create: function() {
		this.add.sprite(0, 0, 'screen-mainmenu');
		this.gameTitle = this.add.sprite(Wyvern._WIDTH*0.5, Wyvern._HEIGHT*0.1, 'title');
		this.gameTitle.anchor.set(0.5,0);
		this.startButton = this.add.button(Wyvern._WIDTH*0.5, Wyvern._HEIGHT*0.5, 'button-start', this.startGame, this, 2, 0, 1);
		this.startButton.anchor.set(0.5,0);
		this.startButton.input.useHandCursor = true;
		
	},
	startGame: function() {
		this.game.state.start('Howto');
	}
};