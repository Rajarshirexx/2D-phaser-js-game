import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import bomb from "../assets/bomb.png";

const PhaserGame = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    class MainScene extends Phaser.Scene {
      preload() {
        this.load.image(
          "background",
          "https://labs.phaser.io/assets/skies/sky4.png"
        );
        this.load.image(
          "ground",
          "https://labs.phaser.io/assets/sprites/platform.png"
        );
        this.load.image(
          "star",
          "https://labs.phaser.io/assets/sprites/star.png"
        );
        this.load.image("bomb", bomb);
        this.load.spritesheet(
          "player",
          "https://labs.phaser.io/assets/sprites/dude.png",
          {
            frameWidth: 32,
            frameHeight: 48,
          }
        );
      }

      create() {
        // Background
        this.add.image(400, 300, "background");

        // Platforms (Static Group)
        const platforms = this.physics.add.staticGroup();
        platforms.create(400, 568, "ground").setScale(2).refreshBody();
        platforms.create(600, 400, "ground");
        platforms.create(50, 250, "ground");
        platforms.create(750, 220, "ground");

        // Player setup
        this.player = this.physics.add.sprite(100, 400, "player");
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, platforms);
        this.player.setGravityY(300);

        // Animations
        this.anims.create({
          key: "left",
          frames: this.anims.generateFrameNumbers("player", {
            start: 0,
            end: 3,
          }),
          frameRate: 10,
          repeat: -1,
        });
        this.anims.create({
          key: "turn",
          frames: [{ key: "player", frame: 4 }],
          frameRate: 20,
        });
        this.anims.create({
          key: "right",
          frames: this.anims.generateFrameNumbers("player", {
            start: 5,
            end: 8,
          }),
          frameRate: 10,
          repeat: -1,
        });

        // Stars Group (Dynamic) with Manual Positioning
        const starPositions = [
          { x: 100, y: 100 },
          { x: 200, y: 150 },
          { x: 70, y: 170 },
          { x: 600, y: 100 },
          { x: 650, y: 160 },
          { x: 750, y: 60 },
          { x: 600, y: 320 },
          { x: 700, y: 275 },
          { x: 770, y: 350 },
        ];

        this.stars = this.physics.add.group();

        starPositions.forEach((pos) => {
          const star = this.stars.create(pos.x, pos.y, "star");
          star.setScale(0.3); // Make the stars smaller (50% scale)
          star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)); // Random bounce between 0.4 and 0.8
        });

        // Manual Bomb Positions
        const bombPositions = [
          { x: 200, y: 300 },
          { x: 200, y: 120 },
          { x: 700, y: 120 },
        ];

        this.bombs = this.physics.add.group();

        bombPositions.forEach((pos) => {
          const bomb = this.bombs.create(pos.x, pos.y, "bomb");
          bomb.setScale(0.8); // Set the size of bombs
          bomb.setBounce(1); // Allow bouncing
          bomb.setCollideWorldBounds(true); // Make bombs collide with the world boundaries
          bomb.setVelocity(Phaser.Math.Between(100, -100), 50); // Set random velocity for movement
        });

        // Collisions
        this.physics.add.collider(this.stars, platforms);
        this.physics.add.collider(
          this.player,
          this.stars,
          this.collectStar,
          null,
          this
        );
        this.physics.add.collider(this.bombs, platforms);
        this.physics.add.collider(
          this.player,
          this.bombs,
          this.hitBomb,
          null,
          this
        );

        // Cursors for Player Movement
        this.cursors = this.input.keyboard.createCursorKeys();

        // Score Text
        this.score = 0;
        this.scoreText = this.add.text(16, 16, "Score: 0", {
          fontSize: "32px",
          fill: "#fff",
        });

        // "Well Done" Text (Initially Hidden)
        this.wellDoneText = this.add
          .text(400, 300, "Well Done Player!", {
            fontSize: "64px",
            fill: "#00ff00",
          })
          .setOrigin(0.5)
          .setVisible(false);

        // "Game Over" Text (Initially Hidden)
        this.gameOverText = this.add
          .text(400, 300, "Game Over!", {
            fontSize: "64px",
            fill: "#ff0000",
          })
          .setOrigin(0.5)
          .setVisible(false);
      }

      collectStar(player, star) {
        star.disableBody(true, true); // Remove the star
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);

        // Check if all stars are collected
        if (this.stars.countActive(true) === 0) {
          this.wellDoneText.setVisible(true); // Show "Well Done" text
          this.physics.pause(); // Stop the game
        }
      }

      hitBomb(player, bomb) {
        // Stop the game, turn the player red, and show "Game Over"
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play("turn");
        this.gameOverText.setVisible(true); // Show "Game Over" text
      }

      update() {
        const speed = 160;

        this.player.setVelocityX(0);
        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-speed);
          this.player.anims.play("left", true);
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(speed);
          this.player.anims.play("right", true);
        } else {
          this.player.anims.play("turn");
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
          this.player.setVelocityY(-330);
        }
      }
    }

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },
      },
      scene: MainScene,
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current.destroy(true);
    };
  }, []);

  return <div className="phaser-game" />;
};

export default PhaserGame;
