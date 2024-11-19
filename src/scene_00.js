import Phaser from "phaser";

export default class Scene_00 extends Phaser.Scene {
    constructor() {
        super({ key: "scene_00" });
    }

    init(data) {
        // Retrieve data passed from the previous game scene (score, enemies killed, and waves)
        this.score = data.score || 0; // Default to 0 if no score data is passed
        this.enemiesKilled = data.enemiesKilled || 0; // Default to 0 if no enemies killed data is passed
        this.waves = data.waves || 0; // Default to 0 if no wave count is passed

        // Retrieve the best wave record stored in localStorage, or default to 0 if not set
        this.bestWaves = parseInt(localStorage.getItem("bestWaves")) || 0;

        // Update the best waves record if the current waves count exceeds the previous best
        if (this.waves > this.bestWaves) {
            this.bestWaves = this.waves; // Update best waves
            localStorage.setItem("bestWaves", this.bestWaves); // Save the new record to localStorage
        }
    }

    preload() {
        // Load game assets: images and audio files
        this.load.image("background", "assets/background.gif");
        this.load.image("button", "assets/rock.png");
        this.load.audio("click", "assets/play.mp3");
        this.load.audio("theme2", "assets/Skyrim_8_bit_2.mp3");
    }

    create() {
        // Add the background sprite, centered on the screen
        const background = this.add.sprite(288, 240, 'background');
        background.setOrigin(0.5, 0.5); // Center the background image
        
        // Create the play button, scale it, and make it interactive
        const button = this.add.image(288, 240, 'button').setScale(0.25).setInteractive();
        
        // Create a text label for the button, placed at the center
        const buttonText = this.add.text(288, 240, 'PLAY', {
            fontFamily: 'MedievalSharp, serif',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
    
        // Play background music in a loop
        this.sound.play('theme2', {
            loop: true,
            volume: 0.02
        });
    
        // Display the player's score if it's greater than 0
        if (this.score > 0) {
            this.add.text(50, 50, `Score: ${this.score}`, {
                fontFamily: 'MedievalSharp, serif',
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            });
        }
    
        // Display the number of enemies killed if greater than 0
        if (this.enemiesKilled > 0) {
            this.add.text(50, 100, `Enemies Killed: ${this.enemiesKilled}`, {
                fontFamily: 'MedievalSharp, serif',
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            });
        }
    
        // Display the best wave count if greater than 0
        if (this.bestWaves > 0) {
            this.add.text(50, 150, `Best Waves: ${this.bestWaves}`, {
                fontFamily: 'MedievalSharp, serif',
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            });
        }
    
        // Add interactivity to the button
        button.on('pointerover', () => {
            button.setTint(0xcccccc); // Apply a tint effect when the mouse hovers over the button
        });
        
        button.on('pointerout', () => {
            button.clearTint(); // Remove the tint when the mouse leaves the button
        });
        
        button.on('pointerdown', () => {
            button.setTint(0xaaaaaa); // Apply a darker tint when the button is pressed
        });
        
        button.on('pointerup', () => {
            // Play the click sound when the button is released
            this.sound.play("click", {
                volume: 0.05
            });
            this.sound.stopByKey('theme2'); // Stop the background music after the button is clicked
            button.clearTint(); // Remove the button press effect
            this.scene.start('scene_01'); // Switch to the next game scene ('scene_01')
        });
    }    
}
