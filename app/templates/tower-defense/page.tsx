'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Pause, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const TILE_SIZE = 50;
const GRID_COLS = 16;
const GRID_ROWS = 10;

// Path definition (grid coordinates)
const PATH = [
  { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 },
  { x: 3, y: 3 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 },
  { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 },
  { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 },
  { x: 9, y: 5 }, { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 11, y: 4 },
  { x: 12, y: 4 }, { x: 12, y: 5 }, { x: 12, y: 6 }, { x: 12, y: 7 },
  { x: 13, y: 7 }, { x: 14, y: 7 }, { x: 15, y: 7 },
];

interface Tower {
  id: number;
  x: number;
  y: number;
  type: 'basic' | 'fast' | 'splash' | 'sniper';
  level: number;
  lastShot: number;
  target: Enemy | null;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  pathIndex: number;
  type: 'normal' | 'fast' | 'tank' | 'boss';
  reward: number;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  targetId: number;
  damage: number;
  speed: number;
  splash: boolean;
}

const TOWER_TYPES = {
  basic: { name: 'Archer', cost: 50, damage: 15, range: 100, fireRate: 1000, color: '#4ade80', emoji: '🏹' },
  fast: { name: 'Crossbow', cost: 75, damage: 8, range: 80, fireRate: 400, color: '#60a5fa', emoji: '🎯' },
  splash: { name: 'Cannon', cost: 100, damage: 25, range: 90, fireRate: 1500, color: '#f97316', emoji: '💣' },
  sniper: { name: 'Ballista', cost: 150, damage: 50, range: 200, fireRate: 2000, color: '#a855f7', emoji: '🗡️' },
};

export default function TowerDefenseTemplate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gold, setGold] = useState(200);
  const [lives, setLives] = useState(20);
  const [wave, setWave] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedTower, setSelectedTower] = useState<keyof typeof TOWER_TYPES | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [waveInProgress, setWaveInProgress] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const gameStateRef = useRef({
    towers: [] as Tower[],
    enemies: [] as Enemy[],
    projectiles: [] as Projectile[],
    nextId: 0,
    gold: 200,
    lives: 20,
    wave: 0,
    score: 0,
    isGameOver: false,
    isPaused: false,
    waveInProgress: false,
    enemiesToSpawn: 0,
    spawnTimer: 0,
  });

  const startGame = () => {
    const state = gameStateRef.current;
    state.towers = [];
    state.enemies = [];
    state.projectiles = [];
    state.nextId = 0;
    state.gold = 200;
    state.lives = 20;
    state.wave = 0;
    state.score = 0;
    state.isGameOver = false;
    state.isPaused = false;
    state.waveInProgress = false;
    state.enemiesToSpawn = 0;
    
    setGold(200);
    setLives(20);
    setWave(0);
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setWaveInProgress(false);
    setSelectedTower(null);
    setIsPlaying(true);
  };

  const startWave = useCallback(() => {
    const state = gameStateRef.current;
    if (state.waveInProgress || state.isGameOver) return;
    
    state.wave++;
    state.waveInProgress = true;
    setWave(state.wave);
    setWaveInProgress(true);
    
    // More enemies each wave
    state.enemiesToSpawn = 5 + state.wave * 2;
    state.spawnTimer = 0;
  }, []);

  const placeTower = useCallback((gridX: number, gridY: number) => {
    if (!selectedTower) return;
    
    const state = gameStateRef.current;
    const towerType = TOWER_TYPES[selectedTower];
    
    if (state.gold < towerType.cost) return;
    
    // Check if tile is on path
    const isOnPath = PATH.some(p => p.x === gridX && p.y === gridY);
    if (isOnPath) return;
    
    // Check if tower already exists
    const towerExists = state.towers.some(t => t.x === gridX && t.y === gridY);
    if (towerExists) return;
    
    state.towers.push({
      id: state.nextId++,
      x: gridX,
      y: gridY,
      type: selectedTower,
      level: 1,
      lastShot: 0,
      target: null,
    });
    
    state.gold -= towerType.cost;
    setGold(state.gold);
  }, [selectedTower]);

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const state = gameStateRef.current;

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const gridX = Math.floor(x / TILE_SIZE);
      const gridY = Math.floor(y / TILE_SIZE);
      
      placeTower(gridX, gridY);
    };

    canvas.addEventListener('click', handleClick);

    const spawnEnemy = () => {
      const waveNum = state.wave;
      const types: Array<'normal' | 'fast' | 'tank' | 'boss'> = ['normal', 'normal', 'normal'];
      
      if (waveNum >= 3) types.push('fast', 'fast');
      if (waveNum >= 5) types.push('tank');
      if (waveNum >= 7 && state.enemiesToSpawn === 1) types.push('boss');
      
      const type = types[Math.floor(Math.random() * types.length)];
      
      const baseStats = {
        normal: { hp: 50, speed: 1, reward: 10 },
        fast: { hp: 30, speed: 2, reward: 15 },
        tank: { hp: 150, speed: 0.5, reward: 25 },
        boss: { hp: 500, speed: 0.3, reward: 100 },
      };
      
      const stats = baseStats[type];
      const scaling = 1 + (waveNum - 1) * 0.2;
      
      state.enemies.push({
        id: state.nextId++,
        x: PATH[0].x * TILE_SIZE + TILE_SIZE / 2,
        y: PATH[0].y * TILE_SIZE + TILE_SIZE / 2,
        hp: Math.floor(stats.hp * scaling),
        maxHp: Math.floor(stats.hp * scaling),
        speed: stats.speed,
        pathIndex: 0,
        type,
        reward: stats.reward,
      });
    };

    const gameLoop = () => {
      if (state.isGameOver || state.isPaused) {
        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      const now = Date.now();

      // Clear
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw grid
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      for (let x = 0; x <= GRID_COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE, 0);
        ctx.lineTo(x * TILE_SIZE, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= GRID_ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * TILE_SIZE);
        ctx.lineTo(CANVAS_WIDTH, y * TILE_SIZE);
        ctx.stroke();
      }

      // Draw path
      ctx.fillStyle = '#3d3d5c';
      PATH.forEach(p => {
        ctx.fillRect(p.x * TILE_SIZE, p.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      });

      // Draw start/end
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(PATH[0].x * TILE_SIZE, PATH[0].y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#ef4444';
      const end = PATH[PATH.length - 1];
      ctx.fillRect(end.x * TILE_SIZE, end.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

      // Spawn enemies
      if (state.waveInProgress && state.enemiesToSpawn > 0) {
        state.spawnTimer++;
        if (state.spawnTimer >= 60) {
          spawnEnemy();
          state.enemiesToSpawn--;
          state.spawnTimer = 0;
        }
      }

      // Update enemies
      state.enemies = state.enemies.filter(enemy => {
        const target = PATH[enemy.pathIndex + 1];
        if (!target) {
          // Reached end
          state.lives--;
          setLives(state.lives);
          if (state.lives <= 0) {
            state.isGameOver = true;
            setGameOver(true);
          }
          return false;
        }

        const targetX = target.x * TILE_SIZE + TILE_SIZE / 2;
        const targetY = target.y * TILE_SIZE + TILE_SIZE / 2;
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
          enemy.pathIndex++;
        } else {
          enemy.x += (dx / dist) * enemy.speed * 2;
          enemy.y += (dy / dist) * enemy.speed * 2;
        }

        // Draw enemy
        const size = enemy.type === 'boss' ? 30 : enemy.type === 'tank' ? 25 : 20;
        const colors = { normal: '#ef4444', fast: '#8b5cf6', tank: '#f97316', boss: '#dc2626' };
        
        ctx.fillStyle = colors[enemy.type];
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, size / 2, 0, Math.PI * 2);
        ctx.fill();

        // HP bar
        const hpWidth = 30;
        const hpHeight = 4;
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.x - hpWidth / 2, enemy.y - size / 2 - 8, hpWidth, hpHeight);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(enemy.x - hpWidth / 2, enemy.y - size / 2 - 8, hpWidth * (enemy.hp / enemy.maxHp), hpHeight);

        return enemy.hp > 0;
      });

      // Check wave complete
      if (state.waveInProgress && state.enemies.length === 0 && state.enemiesToSpawn === 0) {
        state.waveInProgress = false;
        setWaveInProgress(false);
        // Bonus gold
        state.gold += 50 + state.wave * 10;
        setGold(state.gold);
      }

      // Update towers
      state.towers.forEach(tower => {
        const towerType = TOWER_TYPES[tower.type];
        const centerX = tower.x * TILE_SIZE + TILE_SIZE / 2;
        const centerY = tower.y * TILE_SIZE + TILE_SIZE / 2;

        // Draw tower
        ctx.fillStyle = towerType.color;
        ctx.fillRect(tower.x * TILE_SIZE + 5, tower.y * TILE_SIZE + 5, TILE_SIZE - 10, TILE_SIZE - 10);
        
        // Draw range indicator when selected
        if (selectedTower === tower.type) {
          ctx.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx.beginPath();
          ctx.arc(centerX, centerY, towerType.range, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Find target
        let target: Enemy | null = null;
        let closestDist = Infinity;
        
        state.enemies.forEach(enemy => {
          const dx = enemy.x - centerX;
          const dy = enemy.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < towerType.range && dist < closestDist) {
            closestDist = dist;
            target = enemy;
          }
        });

        // Shoot
        if (target && now - tower.lastShot >= towerType.fireRate) {
          tower.lastShot = now;
          state.projectiles.push({
            id: state.nextId++,
            x: centerX,
            y: centerY,
            targetId: target.id,
            damage: towerType.damage * tower.level,
            speed: 8,
            splash: tower.type === 'splash',
          });
        }
      });

      // Update projectiles
      state.projectiles = state.projectiles.filter(proj => {
        const target = state.enemies.find(e => e.id === proj.targetId);
        if (!target) return false;

        const dx = target.x - proj.x;
        const dy = target.y - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) {
          // Hit
          if (proj.splash) {
            // Splash damage
            state.enemies.forEach(enemy => {
              const edx = enemy.x - proj.x;
              const edy = enemy.y - proj.y;
              const eDist = Math.sqrt(edx * edx + edy * edy);
              if (eDist < 50) {
                enemy.hp -= proj.damage * (1 - eDist / 50);
                if (enemy.hp <= 0) {
                  state.gold += enemy.reward;
                  state.score += enemy.reward;
                  setGold(state.gold);
                  setScore(state.score);
                }
              }
            });
          } else {
            target.hp -= proj.damage;
            if (target.hp <= 0) {
              state.gold += target.reward;
              state.score += target.reward;
              setGold(state.gold);
              setScore(state.score);
            }
          }
          return false;
        }

        proj.x += (dx / dist) * proj.speed;
        proj.y += (dy / dist) * proj.speed;

        // Draw projectile
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('click', handleClick);
    };
  }, [isPlaying, placeTower, selectedTower]);

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
            Back
          </Link>
          <div className="text-sm text-gray-400">Template: Tower Defense</div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold mb-2">🏰 Tower Master</h1>
          <p className="text-gray-400">Place towers to defend against waves of enemies!</p>
        </div>

        {!isPlaying ? (
          <div className="flex flex-col items-center justify-center py-12">
            <button
              onClick={startGame}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <Play className="w-6 h-6" />
              START GAME
            </button>
            
            <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
              {Object.entries(TOWER_TYPES).map(([key, tower]) => (
                <div key={key} className="p-4 bg-white/5 rounded-xl text-center">
                  <div className="text-3xl mb-2">{tower.emoji}</div>
                  <div className="font-semibold" style={{ color: tower.color }}>{tower.name}</div>
                  <div className="text-sm text-gray-400">{tower.cost} gold</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-white/5 rounded-xl text-center">
                <div className="text-yellow-400 font-bold text-xl">💰 {gold}</div>
                <div className="text-xs text-gray-500">Gold</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-center">
                <div className="text-red-400 font-bold text-xl">❤️ {lives}</div>
                <div className="text-xs text-gray-500">Lives</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-center">
                <div className="text-blue-400 font-bold text-xl">🌊 {wave}</div>
                <div className="text-xs text-gray-500">Wave</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-center">
                <div className="text-green-400 font-bold text-xl">⭐ {score}</div>
                <div className="text-xs text-gray-500">Score</div>
              </div>
            </div>

            {/* Tower Selection */}
            <div className="flex gap-2 mb-4 justify-center">
              {Object.entries(TOWER_TYPES).map(([key, tower]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTower(key as keyof typeof TOWER_TYPES)}
                  disabled={gold < tower.cost}
                  className={`p-3 rounded-xl transition-all ${
                    selectedTower === key 
                      ? 'ring-2 ring-white bg-white/20' 
                      : 'bg-white/5 hover:bg-white/10'
                  } ${gold < tower.cost ? 'opacity-50' : ''}`}
                >
                  <div className="text-2xl">{tower.emoji}</div>
                  <div className="text-xs" style={{ color: tower.color }}>{tower.cost}g</div>
                </button>
              ))}
              <button
                onClick={() => setSelectedTower(null)}
                className={`p-3 rounded-xl bg-white/5 hover:bg-white/10 ${!selectedTower ? 'ring-2 ring-white' : ''}`}
              >
                <div className="text-2xl">❌</div>
                <div className="text-xs text-gray-400">None</div>
              </button>
            </div>

            {/* Canvas */}
            <div className="relative bg-black rounded-2xl overflow-hidden mb-4">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="block cursor-pointer"
              />
              
              {gameOver && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-4xl font-bold text-red-400 mb-4">Game Over!</h2>
                    <p className="text-xl mb-2">Waves Survived: {wave}</p>
                    <p className="text-xl text-yellow-400 mb-6">Score: {score}</p>
                    <button
                      onClick={startGame}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wave Button */}
            <div className="flex justify-center gap-4">
              {!waveInProgress && !gameOver && (
                <button
                  onClick={startWave}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-all"
                >
                  Start Wave {wave + 1}
                </button>
              )}
              <button
                onClick={() => {
                  gameStateRef.current.isPaused = !gameStateRef.current.isPaused;
                  setIsPaused(!isPaused);
                }}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
              <button
                onClick={startGame}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {/* Customize CTA */}
        {!isPlaying && (
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Create your own tower defense!</h3>
            <p className="text-gray-400 mb-4">
              Add new tower types, change maps, or create unique enemies with Javari AI.
            </p>
            <Link
              href="/create/chat?template=tower-defense"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors"
            >
              Customize with AI
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
