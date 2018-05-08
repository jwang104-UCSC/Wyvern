var game = new Phaser.Game(200, 320, Phaser.CANVAS, 'game');
game.state.add('Boot', Wyvern.Boot);
game.state.add('Preloader', Preloader);
game.state.add('MainMenu', Wyvern.MainMenu);
game.state.add('Howto', Wyvern.Howto);
game.state.add('Game', Wyvern.Game);
game.state.start('Boot');