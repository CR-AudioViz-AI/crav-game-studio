'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';

// Game configuration
const GAME_CONFIG = {
  title: 'Pixel Adventure',
  description: 'Classic platformer - collect coins, avoid enemies, reach the flag!',
  controls: {
    left: 'A or ←',
    right: 'D or →',
    jump: 'W, ↑, or SPACE',
  },
  credits: {
    play: 0, // Free template
    create: 5,
  },
};

export default function PlatformerTemplate() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    if (!isPlaying || typeof window === 'undefined') return;

    // Dynamically import Phaser (client-side only)
    import('phaser').then((Phaser) => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }

      // Game scene
      class GameScene extends Phaser.Scene {
        player: any;
        platforms: any;
        coins: any;
        enemies: any;
        flag: any;
        cursors: any;
        wasd: any;
        scoreText: any;
        livesText: any;
        levelText: any;
        gameOverText: any;
        currentScore: number = 0;
        currentLives: number = 3;
        currentLevel: number = 1;
        isGameOver: boolean = false;
        canJump: boolean = true;

        constructor() {
          super({ key: 'GameScene' });
        }

        preload() {
          // Create simple graphics as textures
          this.createTextures();
        }

        createTextures() {
          // Player (blue square with eyes)
          const playerGraphics = this.make.graphics({ x: 0, y: 0 });
          playerGraphics.fillStyle(0x4a90d9);
          playerGraphics.fillRoundedRect(0, 0, 32, 40, 4);
          playerGraphics.fillStyle(0xffffff);
          playerGraphics.fillCircle(10, 12, 5);
          playerGraphics.fillCircle(22, 12, 5);
          playerGraphics.fillStyle(0x000000);
          playerGraphics.fillCircle(12, 12, 2);
          playerGraphics.fillCircle(24, 12, 2);
          playerGraphics.generateTexture('player', 32, 40);

          // Platform (brown with grass)
          const platformGraphics = this.make.graphics({ x: 0, y: 0 });
          platformGraphics.fillStyle(0x8B4513);
          platformGraphics.fillRect(0, 8, 64, 24);
          platformGraphics.fillStyle(0x228B22);
          platformGraphics.fillRect(0, 0, 64, 12);
          platformGraphics.generateTexture('platform', 64, 32);

          // Ground
          const groundGraphics = this.make.graphics({ x: 0, y: 0 });
          groundGraphics.fillStyle(0x8B4513);
          groundGraphics.fillRect(0, 12, 800, 52);
          groundGraphics.fillStyle(0x228B22);
          groundGraphics.fillRect(0, 0, 800, 16);
          groundGraphics.generateTexture('ground', 800, 64);

          // Coin (yellow circle)
          const coinGraphics = this.make.graphics({ x: 0, y: 0 });
          coinGraphics.fillStyle(0xFFD700);
          coinGraphics.fillCircle(12, 12, 12);
          coinGraphics.fillStyle(0xFFA500);
          coinGraphics.fillCircle(12, 12, 8);
          coinGraphics.generateTexture('coin', 24, 24);

          // Enemy (red spiky)
          const enemyGraphics = this.make.graphics({ x: 0, y: 0 });
          enemyGraphics.fillStyle(0xFF4444);
          enemyGraphics.fillCircle(16, 20, 16);
          enemyGraphics.fillStyle(0xCC0000);
          enemyGraphics.fillTriangle(16, 0, 8, 12, 24, 12);
          enemyGraphics.fillStyle(0xFFFFFF);
          enemyGraphics.fillCircle(10, 18, 4);
          enemyGraphics.fillCircle(22, 18, 4);
          enemyGraphics.fillStyle(0x000000);
          enemyGraphics.fillCircle(10, 18, 2);
          enemyGraphics.fillCircle(22, 18, 2);
          enemyGraphics.generateTexture('enemy', 32, 36);

          // Flag
          const flagGraphics = this.make.graphics({ x: 0, y: 0 });
          flagGraphics.fillStyle(0x8B4513);
          flagGraphics.fillRect(0, 0, 8, 80);
          flagGraphics.fillStyle(0x00FF00);
          flagGraphics.fillTriangle(8, 0, 8, 30, 48, 15);
          flagGraphics.generateTexture('flag', 48, 80);

          // Background
          const bgGraphics = this.make.graphics({ x: 0, y: 0 });
          bgGraphics.fillStyle(0x87CEEB);
          bgGraphics.fillRect(0, 0, 800, 600);
          // Add clouds
          bgGraphics.fillStyle(0xFFFFFF, 0.8);
          bgGraphics.fillCircle(100, 80, 30);
          bgGraphics.fillCircle(130, 80, 40);
          bgGraphics.fillCircle(160, 80, 30);
          bgGraphics.fillCircle(500, 120, 25);
          bgGraphics.fillCircle(530, 120, 35);
          bgGraphics.fillCircle(560, 120, 25);
          bgGraphics.fillCircle(700, 60, 20);
          bgGraphics.fillCircle(720, 60, 30);
          bgGraphics.generateTexture('background', 800, 600);
        }

        create() {
          // Background
          this.add.image(400, 300, 'background');

          // Platforms group
          this.platforms = this.physics.add.staticGroup();

          // Ground
          this.platforms.create(400, 584, 'ground');

          // Floating platforms - Level design
          const platformPositions = [
            { x: 100, y: 450 },
            { x: 300, y: 380 },
            { x: 500, y: 320 },
            { x: 200, y: 250 },
            { x: 400, y: 180 },
            { x: 650, y: 250 },
            { x: 700, y: 400 },
          ];

          platformPositions.forEach(pos => {
            this.platforms.create(pos.x, pos.y, 'platform');
          });

          // Player
          this.player = this.physics.add.sprite(50, 500, 'player');
          this.player.setBounce(0.1);
          this.player.setCollideWorldBounds(true);
          this.player.setGravityY(300);

          // Coins
          this.coins = this.physics.add.group();
          const coinPositions = [
            { x: 100, y: 400 },
            { x: 300, y: 330 },
            { x: 500, y: 270 },
            { x: 200, y: 200 },
            { x: 400, y: 130 },
            { x: 650, y: 200 },
            { x: 150, y: 520 },
            { x: 350, y: 520 },
            { x: 550, y: 520 },
          ];

          coinPositions.forEach(pos => {
            const coin = this.coins.create(pos.x, pos.y, 'coin');
            coin.setBounceY(0.3);
            // Floating animation
            this.tweens.add({
              targets: coin,
              y: pos.y - 10,
              duration: 500 + Math.random() * 500,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          });

          // Enemies
          this.enemies = this.physics.add.group();
          const enemyPositions = [
            { x: 300, y: 520, patrol: { min: 200, max: 400 } },
            { x: 600, y: 520, patrol: { min: 500, max: 700 } },
            { x: 400, y: 140, patrol: { min: 350, max: 450 } },
          ];

          enemyPositions.forEach(pos => {
            const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
            enemy.setBounce(0);
            enemy.setCollideWorldBounds(true);
            enemy.setVelocityX(80);
            enemy.patrol = pos.patrol;
            enemy.direction = 1;
          });

          // Flag (goal)
          this.flag = this.physics.add.staticSprite(750, 140, 'flag');

          // Collisions
          this.physics.add.collider(this.player, this.platforms);
          this.physics.add.collider(this.coins, this.platforms);
          this.physics.add.collider(this.enemies, this.platforms);

          // Overlaps
          this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
          this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, undefined, this);
          this.physics.add.overlap(this.player, this.flag, this.reachFlag, undefined, this);

          // Controls
          this.cursors = this.input.keyboard!.createCursorKeys();
          this.wasd = this.input.keyboard!.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
          });

          // UI
          this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
          });

          this.livesText = this.add.text(16, 48, '❤️❤️❤️', {
            fontSize: '24px',
          });

          this.levelText = this.add.text(700, 16, 'Level 1', {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
          });

          // Initialize
          this.currentScore = 0;
          this.currentLives = 3;
          this.isGameOver = false;
        }

        update() {
          if (this.isGameOver) return;

          // Player movement
          const speed = 200;
          const jumpForce = -450;

          if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
          } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
          } else {
            this.player.setVelocityX(0);
          }

          // Jump
          const isOnGround = this.player.body.touching.down || this.player.body.blocked.down;
          const jumpPressed = this.cursors.up.isDown || this.wasd.up.isDown || this.wasd.space.isDown;

          if (jumpPressed && isOnGround && this.canJump) {
            this.player.setVelocityY(jumpForce);
            this.canJump = false;
          }

          if (!jumpPressed) {
            this.canJump = true;
          }

          // Enemy patrol
          this.enemies.children.iterate((enemy: any) => {
            if (enemy.x <= enemy.patrol.min) {
              enemy.setVelocityX(80);
              enemy.setFlipX(false);
            } else if (enemy.x >= enemy.patrol.max) {
              enemy.setVelocityX(-80);
              enemy.setFlipX(true);
            }
            return true;
          });

          // Fall death
          if (this.player.y > 580) {
            this.loseLife();
          }
        }

        collectCoin(player: any, coin: any) {
          coin.destroy();
          this.currentScore += 100;
          this.scoreText.setText('Score: ' + this.currentScore);
          setScore(this.currentScore);

          // Check if all coins collected
          if (this.coins.countActive() === 0) {
            // Bonus points
            this.currentScore += 500;
            this.scoreText.setText('Score: ' + this.currentScore);
            setScore(this.currentScore);
          }
        }

        hitEnemy(player: any, enemy: any) {
          // Check if player is falling onto enemy (stomp)
          if (player.body.velocity.y > 0 && player.y < enemy.y - 20) {
            // Stomp enemy
            enemy.destroy();
            player.setVelocityY(-300);
            this.currentScore += 200;
            this.scoreText.setText('Score: ' + this.currentScore);
            setScore(this.currentScore);
          } else {
            // Player hit by enemy
            this.loseLife();
          }
        }

        loseLife() {
          if (this.isGameOver) return;

          this.currentLives--;
          const hearts = '❤️'.repeat(this.currentLives) + '🖤'.repeat(3 - this.currentLives);
          this.livesText.setText(hearts);
          setLives(this.currentLives);

          if (this.currentLives <= 0) {
            this.gameOver();
          } else {
            // Respawn
            this.player.setPosition(50, 500);
            this.player.setVelocity(0, 0);

            // Brief invincibility flash
            this.tweens.add({
              targets: this.player,
              alpha: 0.5,
              duration: 100,
              yoyo: true,
              repeat: 5,
            });
          }
        }

        reachFlag(player: any, flag: any) {
          if (this.isGameOver) return;

          this.isGameOver = true;
          this.physics.pause();

          // Victory!
          this.currentScore += 1000;
          setScore(this.currentScore);
          setGameWon(true);

          const victoryText = this.add.text(400, 300, '🎉 LEVEL COMPLETE! 🎉', {
            fontSize: '48px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 6,
          }).setOrigin(0.5);

          this.add.text(400, 360, `Score: ${this.currentScore}`, {
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
          }).setOrigin(0.5);
        }

        gameOver() {
          this.isGameOver = true;
          this.physics.pause();
          setGameOver(true);

          this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
            fontSize: '64px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6,
          }).setOrigin(0.5);

          this.add.text(400, 360, `Final Score: ${this.currentScore}`, {
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
          }).setOrigin(0.5);
        }
      }

      // Create game
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameContainerRef.current!,
        backgroundColor: '#87CEEB',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 500 },
            debug: false,
          },
        },
        scene: GameScene,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      };

      gameRef.current = new Phaser.Game(config);
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [isPlaying]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setGameWon(false);
  };

  const restartGame = () => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
    setIsPlaying(false);
    setTimeout(() => startGame(), 100);
  };

  const togglePause = () => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('GameScene');
      if (scene) {
        if (isPaused) {
          scene.physics.resume();
        } else {
          scene.physics.pause();
        }
        setIsPaused(!isPaused);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/create/template"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Templates
          </Link>
          <div className="text-sm text-gray-400">
            Template: Platformer
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Game Info */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{GAME_CONFIG.title}</h1>
          <p className="text-gray-400">{GAME_CONFIG.description}</p>
        </div>

        {/* Game Container */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl mb-6">
          {!isPlaying ? (
            // Start Screen
            <div className="aspect-[4/3] flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 to-sky-600 p-8">
              <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                🎮 {GAME_CONFIG.title}
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Collect coins, avoid enemies, reach the flag!
              </p>
              <button
                onClick={startGame}
                className="flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <Play className="w-6 h-6" />
                PLAY NOW
              </button>
              
              {/* Controls */}
              <div className="mt-8 p-4 bg-black/30 rounded-xl backdrop-blur-sm">
                <h3 className="font-semibold mb-2 text-center">Controls</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-yellow-300">← / A</div>
                    <div className="text-white/70">Move Left</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-300">↑ / W / Space</div>
                    <div className="text-white/70">Jump</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-300">→ / D</div>
                    <div className="text-white/70">Move Right</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Game Canvas
            <div className="relative">
              <div ref={gameContainerRef} className="aspect-[4/3]" />
              
              {/* Game Controls Overlay */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={togglePause}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm transition-colors"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>
                <button
                  onClick={restartGame}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Pause Overlay */}
              {isPaused && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-4xl font-bold mb-4">PAUSED</h2>
                    <button
                      onClick={togglePause}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors"
                    >
                      Resume
                    </button>
                  </div>
                </div>
              )}

              {/* Game Over Overlay */}
              {(gameOver || gameWon) && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className={`text-4xl font-bold mb-2 ${gameWon ? 'text-green-400' : 'text-red-400'}`}>
                      {gameWon ? '🎉 YOU WIN!' : '💀 GAME OVER'}
                    </h2>
                    <p className="text-2xl mb-4">Score: {score}</p>
                    <button
                      onClick={restartGame}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Game Stats */}
        {isPlaying && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-sm text-gray-400">Score</div>
              <div className="text-2xl font-bold text-yellow-400">{score}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-sm text-gray-400">Lives</div>
              <div className="text-2xl">{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-sm text-gray-400">Level</div>
              <div className="text-2xl font-bold text-purple-400">{level}</div>
            </div>
          </div>
        )}

        {/* Customize CTA */}
        <div className="p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold mb-2">Like this template?</h3>
          <p className="text-gray-400 mb-4">
            Customize it with your own characters, levels, and mechanics using Javari AI.
          </p>
          <div className="flex gap-4">
            <Link
              href="/create/chat?template=platformer"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors"
            >
              Customize with AI
            </Link>
            <Link
              href="/create/template"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors"
            >
              More Templates
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
