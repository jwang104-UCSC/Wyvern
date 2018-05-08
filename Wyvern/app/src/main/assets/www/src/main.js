var game = new Phaser.Game(200, 320, Phaser.CANVAS, 'game');
game.state.add('Boot', Boot);
game.state.add('Preloader', Preloader);
game.state.add('MainMenu', MainMenu);
game.state.add('Howto', Howto);
game.state.add('Game', Game);
game.state.start('Boot');