import Phaser from 'phaser';

import Scene_00 from "./scene_00"; // Importing the main menu scene (scene_00)
import Scene_01 from './scene_01'; // Importing the game scene (scene_01)

const config = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 576,
	height: 480,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { x: 0, y: 0 }, // No gravity for this game
			debug: false,
		},
	},
	// Define the scenes to be used in the game; `scene_00` is the menu and `Scene_01` is the main game
	scene: [Scene_00, Scene_01],
};

export default new Phaser.Game(config);
