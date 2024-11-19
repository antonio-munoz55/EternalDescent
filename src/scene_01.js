import Phaser from "phaser";

export default class Scene_01 extends Phaser.Scene {
  constructor() {
    super({ key: "scene_01" });
  }

  init() {
    // Initialize essential game variables
    this.lives = 3; // Player starts with 3 lives
    this.waveCount = 1; // Initial wave number
    this.enemyCount = 5; // Number of enemies in the first wave
    this.score = 0; // Player's score starts at 0

    // Player state flags
    this.isAttacking = false; // Tracks if the player is attacking
    this.isInvulnerable = false; // Tracks if the player is in an invulnerable state
  }

  preload() {
    // Load all assets: images, sounds, tilemaps, and sprite atlases
    this.load.image("terrain", "assets/mainlevbuild.png");
    this.load.image("candle", "assets/candleA_01.png");

    this.load.image("coin", "assets/coin.png");
    this.load.image("heart", "assets/heart.png");

    // Load audio assets
    this.load.audio("theme", "assets/Skyrim_8_bit.mp3");
    this.load.audio("sword", "assets/sword.mp3");
    this.load.audio("hit", "assets/hit.mp3");
    this.load.audio("death", "assets/death.mp3");
    this.load.audio("enemyDeath", "assets/enemy_death.mp3");
    this.load.audio("coin", "assets/coin.mp3");
    this.load.audio("endGame", "assets/end_game.mp3");
    this.load.audio("roll", "assets/roll.mp3");
    this.load.audio("live", "assets/1live.mp3");
    this.load.audio("run", "assets/run.mp3");

    // Load tilemap for the game world
    this.load.tilemapTiledJSON("map", "assets/map.json");

    // Load sprite atlases for the player and enemies
    this.load.atlas("player", "assets/character.png", "assets/character.json");

    this.load.atlas("enemy1", "assets/enemy1.png", "assets/enemy1.json");
  }

  create() {
    // Create the game map and define layers
    const map = this.make.tilemap({
      key: "map"
    });
    const terrainTile = map.addTilesetImage("mainlevbuild", "terrain");
    const candleTile = map.addTilesetImage("candleA_01", "candle");

    // Set up the map layers
    map.createLayer("floor", terrainTile);
    map.createLayer("torch", candleTile);

    map.createLayer("rack", terrainTile);

    // Create the player character and set its physics
    this.player = this.physics.add.sprite(288, 240, "player");
    this.player.setCollideWorldBounds(true);

    // Adjust the player's hitbox for better collision detection
    this.player.setSize(this.player.width * 0.5, this.player.height * 0.7); // 50% width, 70% height
    this.player.setOffset(this.player.width * 0.2, this.player.height * 0.1); // Offset to center the hitbox

    // Set up collisions for the walls
    const wall = map.createLayer("wall", terrainTile);
    wall.setCollisionByExclusion([-1], true);

    // Enable collisions between the player and the walls
    this.physics.add.collider(this.player, wall);

    // Set up keyboard inputs for movement and actions
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.W
    );
    this.aKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.A
    );
    this.dKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.D
    );
    this.sKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.S
    );
    this.spacebar = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.eKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );
    this.pKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.P
    );
    this.cKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.C
    );

    // Play background music on loop
    this.sound.play('theme', {
      loop: true,
      volume: 0.03
    });

    // Define player animations
    this.anims.create({
      key: "move",
      frames: this.anims.generateFrameNames("player", {
        prefix: "move_",
        start: 1,
        end: 10,
        zeroPad: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNames("player", {
        prefix: "idle_",
        start: 1,
        end: 10,
        zeroPad: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "roll",
      frames: this.anims.generateFrameNames("player", {
        prefix: "roll_",
        start: 1,
        end: 12,
        zeroPad: 2,
      }),
      frameRate: 20,
      repeat: 0,
    });

    this.anims.create({
      key: "death",
      frames: this.anims.generateFrameNames("player", {
        prefix: "death_",
        start: 1,
        end: 10,
        zeroPad: 2,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.anims.create({
      key: "attack",
      frames: this.anims.generateFrameNames("player", {
        prefix: "attack_",
        start: 1,
        end: 4,
        zeroPad: 2,
      }),
      frameRate: 10,
      repeat: 0,
    });

    // Define enemy animations
    this.anims.create({
      key: "enemyMove",
      frames: this.anims.generateFrameNames("enemy1", {
        prefix: "move_",
        start: 1,
        end: 8,
        zeroPad: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "EnemyDeath",
      frames: this.anims.generateFrameNames("enemy1", {
        prefix: "death_",
        start: 1,
        end: 6,
        zeroPad: 2,
      }),
      frameRate: 10,
      repeat: 0,
    });

    // Initialize the enemy group with physics
    this.enemies = this.physics.add.group();

    this.physics.add.collider(this.enemies, wall);

    // Start the first wave of enemies
    this.createWave(this.enemyCount);

    // Add collision detection between enemies
    this.physics.add.collider(this.enemies, this.enemies);

    // Create the player's attack zone
    this.attackZone = this.add.zone(this.player.x, this.player.y, 30, 35); // Initial size of attack zone
    this.physics.add.existing(this.attackZone);

    // Ensure the attack zone behaves like a dynamic body
    const body = this.attackZone.body;
    if (body instanceof Phaser.Physics.Arcade.Body) {
      body.setImmovable(false);
      body.moves = true;
    }

    // Overlap detection for attack zone and enemies
    this.physics.add.overlap(this.attackZone, this.enemies, (zone, enemy) => {
      if (this.isAttacking && enemy instanceof Phaser.Physics.Arcade.Sprite && !enemy.getData("isDead")) {
        enemy.anims.play("EnemyDeath", true); // Play enemy death animation
        enemy.setVelocity(0);

        this.sound.play("enemyDeath", {
          volume: 0.03
        });

        this.spawnCoins(enemy.x, enemy.y); // Spawn coins at enemy location

        enemy.setData("isDead", true); // Mark enemy as dead

        this.enemiesKilled++; // Increment kill counter

        enemy.once("animationcomplete", (anim) => {
          if (anim.key === "EnemyDeath") {
            enemy.destroy(); // Destroy enemy after animation ends
          }
        });
      }
    });

    const attackZoneBody = this.attackZone.body;
    if (attackZoneBody instanceof Phaser.Physics.Arcade.Body) {
      attackZoneBody.setImmovable(false);
      attackZoneBody.moves = true;
    }

    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerHit, null, this);

    this.physics.add.overlap(this.attackZone, this.enemies, this.handleEnemyHit, null, this);


    // Add text elements to display score, lives, and wave count
    this.scoreText = this.add.text(16, 46, `Score: ${this.score}`, {
      fontSize: "32px",
      color: "#ffffff"
    });

    this.livesText = this.add.text(16, 16, `Lives: ${this.lives}`, {
      fontSize: '32px',
      color: '#ffffff'
    });

    this.waveText = this.add.text(400, 16, `Wave: ${this.waveCount}`, {
      fontSize: "32px",
      color: "#ffffff"
    });

    map.createLayer("decoration", terrainTile);

    // Initialize state variables for rolling and waves
    this.lastRollTime = 0;
    this.isRolling = false;
    this.rollDuration = 1200;
    this.enemiesKilled = 0; // Counter for enemies defeated
  }

  update() {
    // Base speeds for walking and rolling
    const speed = 100; // Standard speed
    const rollSpeed = 150; // Speed during a roll
    let moveX = 0; // Velocity along the X-axis
    let moveY = 0; // Velocity along the Y-axis
  
    // If the player is dead, movement and animations should not be updated
    if (this.lives > 0) {
      // Player movement (only if not rolling)
      if (!this.isRolling) {
        // Check for horizontal movement (left/right)
        if (this.cursors.left.isDown || this.aKey.isDown) {
          moveX = -1; // Move left
          this.player.setFlipX(true); // Flip the sprite to face left
        } else if (this.cursors.right.isDown || this.dKey.isDown) {
          moveX = 1; // Move right
          this.player.setFlipX(false); // Reset the flip to face right
        }

        // Check for vertical movement (up/down)
        if (this.cursors.up.isDown || this.wKey.isDown) {
          moveY = -1; // Move up
        } else if (this.cursors.down.isDown || this.sKey.isDown) {
          moveY = 1; // Move down
        }

        // Normalize diagonal movement to maintain consistent speed
        if (moveX !== 0 && moveY !== 0) {
          moveX *= Math.SQRT1_2; // Adjust X velocity
          moveY *= Math.SQRT1_2; // Adjust Y velocity
        }

        // Apply the calculated velocity to the player
        this.player.setVelocityX(moveX * speed);
        this.player.setVelocityY(moveY * speed);

        // Play movement or idle animations
        if (moveX !== 0 || moveY !== 0) {
          if (!this.isAttacking) {
            this.player.anims.play("move", true); // Play movement animation

            // Play "run" sound only when moving
            if (!this.runSoundPlaying) {
              this.sound.play("run", {
                loop: true, // Loop the sound while moving
                volume: 0.01
              });
              this.runSoundPlaying = true; // Mark the sound as playing
            }
          }
        } else if (!this.isAttacking) {
          this.player.anims.play("idle", true); // Play idle animation

          // Stop the "run" sound when the player stops moving
          if (this.runSoundPlaying) {
            this.sound.stopByKey("run");
            this.runSoundPlaying = false; // Mark the sound as stopped
          }
        }
      }

      // Rolling action (if not currently rolling or attacking)
      if (Phaser.Input.Keyboard.JustDown(this.spacebar) && !this.isRolling && !this.isAttacking) {
        this.isRolling = true; // Mark the player as rolling
        this.player.setVelocityX(moveX * rollSpeed); // Apply rolling speed on X
        this.player.setVelocityY(moveY * rollSpeed); // Apply rolling speed on Y
        this.player.anims.play("roll", true); // Play rolling animation

        // Play rolling sound
        this.sound.play("roll", {
          volume: 0.08
        });

        // Detect when the rolling animation ends
        this.player.once("animationcomplete-roll", () => {
          this.isRolling = false; // End rolling state
          this.player.setVelocity(0); // Stop movement at the end of the roll
        });
      }

      // Handle attack (if not already attacking or rolling)
      if ((Phaser.Input.Keyboard.JustDown(this.eKey) || Phaser.Input.Keyboard.JustDown(this.pKey)) && !this.isAttacking && !this.isRolling) {
        this.isAttacking = true; // Mark the player as attacking
        this.player.setVelocity(0); // Stop movement during the attack
        this.player.anims.play("attack", true); // Play attack animation

        // Play sword attack sound
        this.sound.play("sword", {
          volume: 0.05
        });

        // Position the attack zone in front of the player
        const offsetX = this.player.flipX ? -30 : 30; // Adjust based on facing direction
        this.attackZone.x = this.player.x + offsetX;
        this.attackZone.y = this.player.y;

        // Reset attack state after animation completes
        this.player.once("animationcomplete", (anim) => {
          if (anim.key === "attack") {
            this.isAttacking = false;
          }
        });
      }

      // Ensure the attack zone follows the player
      if (!this.isAttacking) {
        this.attackZone.x = this.player.x;
        this.attackZone.y = this.player.y;
      }

      // Update enemy movement to chase the player
      this.enemies.children.iterate((enemy) => {
        if (enemy && enemy instanceof Phaser.Physics.Arcade.Sprite) {
          // Ensure the enemy is alive before updating its behavior
          if (!enemy.getData("isDead")) {
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            const enemySpeed = 80; // Speed at which enemies move

            if (distance > 10) {
              this.physics.moveToObject(enemy, this.player, enemySpeed); // Move towards player

              // Flip enemy sprite direction based on player's position
              if (enemy.x < this.player.x) {
                enemy.setFlipX(false); // Facing right
              } else if (enemy.x > this.player.x) {
                enemy.setFlipX(true); // Facing left
              }
            } else {
              enemy.setVelocity(0); // Stop moving when close enough
            }
          } else {
            // Ensure dead enemies have no velocity
            enemy.setVelocity(0);
          }
        }
        return true; // Required for `iterate` loop
      });

    }
  }

  spawnCoins(x, y) {
    // Generate a random number of coins to spawn, between 0 and 3
    const coinCount = Phaser.Math.Between(0, 3); // 0 to 3 coins per enemy
    for (let i = 0; i < coinCount; i++) {
      // Create a coin at the given coordinates (x, y) and make it interactive
      const coin = this.physics.add.image(x, y, "coin").setInteractive();
      coin.setScale(0.03); // Scale down the coin's size

      // Add a random velocity to the coin to scatter it around the spawn point
      coin.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));

      // Prevent the coin from overlapping or clipping through enemies
      this.physics.add.collider(coin, this.enemies);

      // Allow the player to collect the coin when overlapping it
      this.physics.add.overlap(this.player, coin, this.collectCoin, null, this);
    }

    // 5% chance that the enemy will drop a heart (health item)
    if (Phaser.Math.Between(1, 100) <= 5) {
      // Create a heart at the same location and make it interactive
      const heart = this.physics.add.image(x, y, "heart").setInteractive();
      heart.setScale(0.08); // Scale the heart to an appropriate size

      // Add random velocity to scatter the heart around the spawn point
      heart.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));

      // Prevent the heart from exiting the designated area by colliding with enemies
      this.physics.add.collider(heart, this.enemies);

      // Allow the player to collect the heart when they overlap with it
      this.physics.add.overlap(this.player, heart, this.collectHeart, null, this);
    }
  }

  collectCoin(player, coin) {
    coin.destroy(); // Destroy the coin when the player collects it
    this.score += 10; // Increase the score by 10 points for each collected coin
    this.scoreText.setText(`Score: ${this.score}`); // Update the score display with the new score value

    // Play the sound effect for collecting a coin
    this.sound.play("coin", {
      volume: 0.03
    });
  }

  collectHeart(player, heart) {
    heart.destroy(); // Destroy the heart when the player collects it
    this.lives++; // Increase the player's lives by 1
    this.livesText.setText(`Lives: ${this.lives}`); // Update the lives display with the new lives count

    // Play the sound effect for collecting a life
    this.sound.play("live", {
      volume: 0.1
    });
  }

  createWave(enemyCount) {
    // Clear existing enemies before spawning new ones
    this.enemies.clear(true, true); // Remove previous enemies

    // Define the spawn area where enemies can appear
    const spawnAreaX = 0; // X-coordinate of the spawn area
    const spawnAreaY = 0; // Y-coordinate of the spawn area
    const spawnAreaWidth = 576; // Width of the spawn area
    const spawnAreaHeight = 480; // Height of the spawn area

    // Define the central "hole" area where no enemies will spawn
    const innerAreaWidth = 150; // Width of the "hole"
    const innerAreaHeight = 150; // Height of the "hole"
    const innerAreaX = spawnAreaX + (spawnAreaWidth - innerAreaWidth) / 2; // X-position of the "hole"
    const innerAreaY = spawnAreaY + (spawnAreaHeight - innerAreaHeight) / 2; // Y-position of the "hole"

    // Create the outer spawn zone (red, blinking area)
    const spawnZone = this.add.rectangle(
      spawnAreaX + spawnAreaWidth / 2,
      spawnAreaY + spawnAreaHeight / 2,
      spawnAreaWidth,
      spawnAreaHeight,
      0xff0000, // Red color
      0.5 // 50% opacity
    );

    // Create the inner "hole" zone (green area)
    const innerZone = this.add.rectangle(
      innerAreaX + innerAreaWidth / 2, // Centrado
      innerAreaY + innerAreaHeight / 2,
      innerAreaWidth,
      innerAreaHeight,
      0x118c00, // Color green
      0.4 // 40% opacity
    );

    // Make only the outer spawn zone blink before enemies appear
    this.tweens.add({
      targets: spawnZone,
      alpha: 0,
      duration: 300,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        // After blinking, destroy the warning zones
        spawnZone.destroy(); // Destroy the spawn zone after blinking
        innerZone.destroy(); // Destroy the inner "hole" zone

        // Create enemies in the highlighted area but avoid the "hole"
        for (let i = 0; i < enemyCount; i++) {
          let x, y;
          do {
            // Generate a random position within the outer area but outside the "hole"
            x = Phaser.Math.Between(spawnAreaX, spawnAreaX + spawnAreaWidth);
            y = Phaser.Math.Between(spawnAreaY, spawnAreaY + spawnAreaHeight);
          } while (
            x > innerAreaX && x < innerAreaX + innerAreaWidth &&
            y > innerAreaY && y < innerAreaY + innerAreaHeight
          ); // If the position is inside the "hole", retry

          // Create the enemy at the selected position
          const enemy = this.enemies.create(x, y, "enemy1");
          enemy.setCollideWorldBounds(true); // Prevent the enemy from leaving the world bounds
          enemy.anims.play("enemyMove", true); // Play the enemy's movement animation
          enemy.setData("isDead", false); // Set an initial "isDead" state for the enemy
        }

        // Set up a timer to check if all enemies have been defeated
        this.time.addEvent({
          delay: 100, // Check every 100 milliseconds
          callback: this.checkEnemiesDefeated,
          callbackScope: this,
          loop: true, // Repeat the check until all enemies are defeated
        });

        this.waveInProgress = false; // Set the wave in progress flag to false as the wave has finished
      }
    });
  }

  checkEnemiesDefeated() {
    // Check if there are no remaining enemies
    const allEnemiesDefeated = this.enemies.children.size === 0;

    if (allEnemiesDefeated && !this.waveInProgress) {
      // If all enemies are defeated and no wave is in progress:
      this.waveInProgress = true; // Prevent starting a new wave while the current one is not finished
      this.waveCount++; // Increment the wave counter
      this.waveText.setText(`Wave: ${this.waveCount}`); // Update the wave text on the screen

      this.enemyCount++; // Increment the number of enemies for the next wave
      this.createWave(this.enemyCount); // Create a new wave with the updated enemy count
    }
  }

  handleEnemyHit(attackZone, enemy) {
    // Check if the player is attacking and the enemy is not dead
    if (this.isAttacking && enemy.getData("isDead") === false) {
      enemy.setData("isDead", true); // Mark the enemy as dead

      enemy.anims.play("EnemyDeath", true); // Play the death animation for the enemy
      enemy.body.enable = false; // Disable the enemy's body to stop future collisions

      this.enemiesKilled++; // Increment the counter of killed enemies

      // After a short delay, destroy the enemy
      this.time.delayedCall(1000, () => {
        enemy.destroy(); // Destroy the enemy after 1 second
      });
    }
  }

  handlePlayerHit(player, enemy) {
    // Check if the player is not invulnerable and the enemy is not dead
    if (!this.isInvulnerable && enemy.getData("isDead") === false) {
      this.lives--; // Reduce the player's lives by 1
      this.livesText.setText(`Lives: ${this.lives}`); // Update the lives display

      this.isInvulnerable = true; // Make the player invulnerable for a short period

      // Play hit sound effect
      this.sound.play("hit", {
        volume: 0.03
      });

      // If the player still has lives left, trigger invulnerability and flashing effect
      if (this.lives > 0) {
        this.time.addEvent({
          delay: 2000, // Set invulnerability period for 2 seconds
          callback: () => {
            this.isInvulnerable = false; // Remove invulnerability after the delay
          },
        });

        // Flashing effect (player turns invisible and visible repeatedly)
        this.tweens.add({
          targets: this.player,
          alpha: 0,
          duration: 200,
          ease: 'Linear',
          repeat: 5,
          yoyo: true,
        });
      } else {
        // Stop the running sound effect (player is dead)
        this.sound.stopByKey("run");

        // Play death sound effect
        this.sound.play("death", {
          volume: 0.1
        });

        // Stop background theme music
        this.sound.stopByKey('theme');

        // Play game over sound effect
        this.sound.play("endGame", {
          volume: 0.08
        });

        // Play death animation for the player
        this.player.anims.play("death", true);
        this.player.once("animationcomplete-death", () => {
          // Trigger game over logic after the death animation completes
          this.physics.pause(); // Pause the physics engine to stop the player
          this.add.text(this.cameras.main.centerX, 300, "Game Over", {
            fontSize: '48px',
            color: '#ff0000'
          }).setOrigin(0.5);

        // Show message to continue the game
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Press C to continue...', {
          fontSize: '32px',
          color: '#fff',
          fontFamily: 'Arial',
          backgroundColor: '#000',
          padding: { x: 10, y: 10 }
        }).setOrigin(0.5);
        });

      // Wait for the 'C' key to be pressed to restart the game
      this.cKey.once('down', () => {
        this.scene.stop('scene_01');  // Stop the current scene
        // Start the main menu scene
        this.scene.start('scene_00', { score: this.score, enemiesKilled: this.enemiesKilled, waves: this.waveCount });
      });
      }
    }
  }
}