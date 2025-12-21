'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, Swords, Shield, Sparkles, Heart, Zap, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Game types
interface Character {
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  level: number;
  exp: number;
  expToLevel: number;
  gold: number;
}

interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  exp: number;
  gold: number;
  sprite: string;
}

interface BattleLog {
  text: string;
  type: 'player' | 'enemy' | 'system' | 'heal';
}

// Enemy definitions
const ENEMIES: Record<string, Omit<Enemy, 'hp'>> = {
  slime: { name: 'Slime', maxHp: 30, attack: 8, defense: 2, exp: 15, gold: 10, sprite: '🟢' },
  goblin: { name: 'Goblin', maxHp: 45, attack: 12, defense: 4, exp: 25, gold: 20, sprite: '👺' },
  skeleton: { name: 'Skeleton', maxHp: 55, attack: 15, defense: 6, exp: 35, gold: 30, sprite: '💀' },
  orc: { name: 'Orc', maxHp: 80, attack: 20, defense: 8, exp: 50, gold: 45, sprite: '👹' },
  dragon: { name: 'Dragon', maxHp: 150, attack: 30, defense: 15, exp: 100, gold: 100, sprite: '🐉' },
};

const SKILLS = [
  { name: 'Power Strike', mpCost: 5, damage: 1.5, description: 'A powerful attack dealing 150% damage' },
  { name: 'Heal', mpCost: 8, heal: 30, description: 'Restore 30 HP' },
  { name: 'Fire Blast', mpCost: 12, damage: 2.0, description: 'Magical fire dealing 200% damage' },
  { name: 'Shield Bash', mpCost: 6, damage: 1.2, stun: true, description: '120% damage, may stun enemy' },
];

export default function RPGTemplate() {
  const [gameState, setGameState] = useState<'menu' | 'explore' | 'battle' | 'victory' | 'defeat'>('menu');
  const [player, setPlayer] = useState<Character>({
    name: 'Hero',
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 15,
    defense: 5,
    level: 1,
    exp: 0,
    expToLevel: 50,
    gold: 0,
  });
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [battleLog, setBattleLog] = useState<BattleLog[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleCount, setBattleCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [enemyStunned, setEnemyStunned] = useState(false);

  // Start new game
  const startGame = () => {
    setPlayer({
      name: 'Hero',
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      attack: 15,
      defense: 5,
      level: 1,
      exp: 0,
      expToLevel: 50,
      gold: 0,
    });
    setBattleCount(0);
    setGameState('explore');
  };

  // Start battle
  const startBattle = useCallback(() => {
    const enemyTypes = Object.keys(ENEMIES);
    // Harder enemies as you progress
    const maxIndex = Math.min(enemyTypes.length - 1, Math.floor(battleCount / 3));
    const enemyIndex = Math.floor(Math.random() * (maxIndex + 1));
    const enemyType = enemyTypes[enemyIndex];
    const enemyData = ENEMIES[enemyType];
    
    // Scale enemy with player level
    const scaleFactor = 1 + (player.level - 1) * 0.2;
    
    setEnemy({
      ...enemyData,
      hp: Math.floor(enemyData.maxHp * scaleFactor),
      maxHp: Math.floor(enemyData.maxHp * scaleFactor),
      attack: Math.floor(enemyData.attack * scaleFactor),
      defense: Math.floor(enemyData.defense * scaleFactor),
    });
    
    setBattleLog([{ text: `A wild ${enemyData.name} appears!`, type: 'system' }]);
    setIsPlayerTurn(true);
    setEnemyStunned(false);
    setShowSkills(false);
    setGameState('battle');
  }, [battleCount, player.level]);

  // Calculate damage
  const calculateDamage = (attacker: number, defender: number, multiplier: number = 1): number => {
    const baseDamage = Math.max(1, attacker - defender / 2);
    const variance = 0.8 + Math.random() * 0.4; // 80% - 120%
    return Math.floor(baseDamage * multiplier * variance);
  };

  // Player attack
  const playerAttack = async (skillIndex?: number) => {
    if (!enemy || isAnimating) return;
    
    setIsAnimating(true);
    let damage: number;
    let logText: string;
    let newMp = player.mp;

    if (skillIndex !== undefined) {
      const skill = SKILLS[skillIndex];
      if (player.mp < skill.mpCost) {
        setBattleLog(prev => [...prev, { text: 'Not enough MP!', type: 'system' }]);
        setIsAnimating(false);
        return;
      }
      
      newMp -= skill.mpCost;
      
      if (skill.heal) {
        const healAmount = Math.min(skill.heal, player.maxHp - player.hp);
        setPlayer(prev => ({ ...prev, hp: prev.hp + healAmount, mp: newMp }));
        setBattleLog(prev => [...prev, { text: `You use ${skill.name}! Restored ${healAmount} HP!`, type: 'heal' }]);
        
        setTimeout(() => {
          setIsAnimating(false);
          setIsPlayerTurn(false);
          setShowSkills(false);
          if (!enemyStunned) {
            setTimeout(() => enemyAttack(), 1000);
          } else {
            setBattleLog(prev => [...prev, { text: `${enemy.name} is stunned and can't move!`, type: 'system' }]);
            setEnemyStunned(false);
            setTimeout(() => setIsPlayerTurn(true), 1000);
          }
        }, 500);
        return;
      }
      
      damage = calculateDamage(player.attack, enemy.defense, skill.damage);
      logText = `You use ${skill.name}! ${damage} damage!`;
      
      if (skill.stun && Math.random() > 0.5) {
        setEnemyStunned(true);
        logText += ' Enemy is stunned!';
      }
      
      setPlayer(prev => ({ ...prev, mp: newMp }));
    } else {
      damage = calculateDamage(player.attack, enemy.defense);
      logText = `You attack! ${damage} damage!`;
    }

    const newEnemyHp = Math.max(0, enemy.hp - damage);
    setEnemy(prev => prev ? { ...prev, hp: newEnemyHp } : null);
    setBattleLog(prev => [...prev, { text: logText, type: 'player' }]);

    setTimeout(() => {
      if (newEnemyHp <= 0) {
        handleVictory();
      } else {
        setIsAnimating(false);
        setIsPlayerTurn(false);
        setShowSkills(false);
        if (!enemyStunned) {
          setTimeout(() => enemyAttack(), 1000);
        } else {
          setBattleLog(prev => [...prev, { text: `${enemy.name} is stunned and can't move!`, type: 'system' }]);
          setEnemyStunned(false);
          setTimeout(() => {
            setIsAnimating(false);
            setIsPlayerTurn(true);
          }, 1000);
        }
      }
    }, 500);
  };

  // Enemy attack
  const enemyAttack = () => {
    if (!enemy) return;
    
    setIsAnimating(true);
    const damage = calculateDamage(enemy.attack, player.defense);
    const newPlayerHp = Math.max(0, player.hp - damage);
    
    setPlayer(prev => ({ ...prev, hp: newPlayerHp }));
    setBattleLog(prev => [...prev, { text: `${enemy.name} attacks! ${damage} damage!`, type: 'enemy' }]);

    setTimeout(() => {
      if (newPlayerHp <= 0) {
        setGameState('defeat');
      } else {
        setIsAnimating(false);
        setIsPlayerTurn(true);
      }
    }, 500);
  };

  // Handle victory
  const handleVictory = () => {
    if (!enemy) return;
    
    const expGained = enemy.exp;
    const goldGained = enemy.gold;
    let newExp = player.exp + expGained;
    let newLevel = player.level;
    let newMaxHp = player.maxHp;
    let newMaxMp = player.maxMp;
    let newAttack = player.attack;
    let newDefense = player.defense;
    let newExpToLevel = player.expToLevel;

    // Level up check
    while (newExp >= newExpToLevel) {
      newExp -= newExpToLevel;
      newLevel++;
      newMaxHp += 20;
      newMaxMp += 10;
      newAttack += 3;
      newDefense += 2;
      newExpToLevel = Math.floor(newExpToLevel * 1.5);
    }

    const leveledUp = newLevel > player.level;

    setPlayer(prev => ({
      ...prev,
      exp: newExp,
      gold: prev.gold + goldGained,
      level: newLevel,
      maxHp: newMaxHp,
      maxMp: newMaxMp,
      hp: leveledUp ? newMaxHp : prev.hp, // Full heal on level up
      mp: leveledUp ? newMaxMp : prev.mp,
      attack: newAttack,
      defense: newDefense,
      expToLevel: newExpToLevel,
    }));

    setBattleLog(prev => [
      ...prev,
      { text: `${enemy.name} defeated!`, type: 'system' },
      { text: `Gained ${expGained} EXP and ${goldGained} Gold!`, type: 'system' },
      ...(leveledUp ? [{ text: `LEVEL UP! You are now level ${newLevel}!`, type: 'system' as const }] : []),
    ]);

    setBattleCount(prev => prev + 1);
    
    setTimeout(() => {
      setGameState('victory');
    }, 2000);
  };

  // Rest at inn
  const restAtInn = () => {
    const cost = 20;
    if (player.gold >= cost) {
      setPlayer(prev => ({
        ...prev,
        hp: prev.maxHp,
        mp: prev.maxMp,
        gold: prev.gold - cost,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/create/template"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <div className="text-sm text-gray-400">Template: RPG</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <AnimatePresence mode="wait">
          {/* Menu */}
          {gameState === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">⚔️</div>
              <h1 className="text-4xl font-bold mb-4">Quest for Glory</h1>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Battle monsters, level up your hero, and become a legend!
              </p>

              <button
                onClick={startGame}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-xl font-bold text-xl mx-auto transition-all transform hover:scale-105 shadow-lg"
              >
                <Swords className="w-6 h-6" />
                BEGIN ADVENTURE
              </button>

              <div className="mt-12 grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-white/5 rounded-xl">
                  <Swords className="w-6 h-6 mx-auto mb-2 text-red-400" />
                  <div className="font-semibold">Turn-Based Combat</div>
                  <div className="text-gray-500">Strategic battles</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <div className="font-semibold">Skills & Magic</div>
                  <div className="text-gray-500">Powerful abilities</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <div className="font-semibold">Level Up</div>
                  <div className="text-gray-500">Grow stronger</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <div className="font-semibold">5 Enemy Types</div>
                  <div className="text-gray-500">Increasing challenge</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Explore */}
          {gameState === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              {/* Player Stats */}
              <div className="p-4 bg-white/5 rounded-xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{player.name}</h2>
                    <p className="text-sm text-gray-400">Level {player.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">💰 {player.gold}</p>
                    <p className="text-sm text-gray-400">Battles: {battleCount}</p>
                  </div>
                </div>

                {/* HP Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-400">HP</span>
                    <span>{player.hp}/{player.maxHp}</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
                      style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                    />
                  </div>
                </div>

                {/* MP Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-400">MP</span>
                    <span>{player.mp}/{player.maxMp}</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
                      style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
                    />
                  </div>
                </div>

                {/* EXP Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-400">EXP</span>
                    <span>{player.exp}/{player.expToLevel}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all"
                      style={{ width: `${(player.exp / player.expToLevel) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-lg text-center">
                  <div className="text-red-400 font-bold">{player.attack}</div>
                  <div className="text-xs text-gray-500">Attack</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg text-center">
                  <div className="text-blue-400 font-bold">{player.defense}</div>
                  <div className="text-xs text-gray-500">Defense</div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={startBattle}
                  className="w-full p-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3"
                >
                  <Swords className="w-5 h-5" />
                  EXPLORE & BATTLE
                </button>

                <button
                  onClick={restAtInn}
                  disabled={player.gold < 20 || (player.hp === player.maxHp && player.mp === player.maxMp)}
                  className="w-full p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-600/50 rounded-xl font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart className="w-5 h-5" />
                  REST AT INN (20 Gold) - Full Heal
                </button>
              </div>
            </motion.div>
          )}

          {/* Battle */}
          {gameState === 'battle' && enemy && (
            <motion.div
              key="battle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              {/* Enemy */}
              <div className="text-center mb-6">
                <motion.div
                  className="text-8xl mb-4"
                  animate={isAnimating && !isPlayerTurn ? { x: [-10, 10, -10, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {enemy.sprite}
                </motion.div>
                <h2 className="text-2xl font-bold">{enemy.name}</h2>
                <div className="mt-2">
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden max-w-xs mx-auto">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-red-600 to-red-400"
                      initial={{ width: '100%' }}
                      animate={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{enemy.hp}/{enemy.maxHp} HP</p>
                </div>
              </div>

              {/* Battle Log */}
              <div className="h-32 bg-black/30 rounded-xl p-3 mb-6 overflow-y-auto">
                {battleLog.map((log, i) => (
                  <p 
                    key={i}
                    className={`text-sm mb-1 ${
                      log.type === 'player' ? 'text-green-400' :
                      log.type === 'enemy' ? 'text-red-400' :
                      log.type === 'heal' ? 'text-blue-400' :
                      'text-yellow-400'
                    }`}
                  >
                    {log.text}
                  </p>
                ))}
              </div>

              {/* Player Status */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-400">HP</span>
                    <span>{player.hp}/{player.maxHp}</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-red-600 to-red-400"
                      animate={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-400">MP</span>
                    <span>{player.mp}/{player.maxMp}</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                      animate={{ width: `${(player.mp / player.maxMp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              {isPlayerTurn && !isAnimating && (
                <div className="space-y-3">
                  {!showSkills ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => playerAttack()}
                        className="p-4 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Swords className="w-5 h-5" />
                        ATTACK
                      </button>
                      <button
                        onClick={() => setShowSkills(true)}
                        className="p-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-5 h-5" />
                        SKILLS
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {SKILLS.map((skill, i) => (
                        <button
                          key={i}
                          onClick={() => playerAttack(i)}
                          disabled={player.mp < skill.mpCost}
                          className="w-full p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex justify-between">
                            <span className="font-bold">{skill.name}</span>
                            <span className="text-blue-400">{skill.mpCost} MP</span>
                          </div>
                          <p className="text-xs text-gray-400">{skill.description}</p>
                        </button>
                      ))}
                      <button
                        onClick={() => setShowSkills(false)}
                        className="w-full p-2 bg-gray-600/20 hover:bg-gray-600/30 rounded-lg text-sm"
                      >
                        Back
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!isPlayerTurn && !isAnimating && (
                <p className="text-center text-gray-400">Enemy's turn...</p>
              )}
            </motion.div>
          )}

          {/* Victory */}
          {gameState === 'victory' && (
            <motion.div
              key="victory"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🏆</div>
              <h1 className="text-4xl font-bold text-yellow-400 mb-4">Victory!</h1>
              <p className="text-gray-400 mb-8">You defeated the enemy!</p>

              <button
                onClick={() => setGameState('explore')}
                className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-xl font-bold text-lg transition-all"
              >
                Continue Adventure
              </button>
            </motion.div>
          )}

          {/* Defeat */}
          {gameState === 'defeat' && (
            <motion.div
              key="defeat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">💀</div>
              <h1 className="text-4xl font-bold text-red-400 mb-4">Defeat...</h1>
              <p className="text-gray-400 mb-4">You were defeated in battle.</p>
              <p className="text-xl mb-8">
                Battles Won: <span className="text-yellow-400 font-bold">{battleCount}</span>
              </p>

              <button
                onClick={startGame}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-xl font-bold text-lg mx-auto transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Customize CTA */}
        {gameState === 'menu' && (
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Create your own RPG!</h3>
            <p className="text-gray-400 mb-4">
              Add new enemies, skills, story, or change the theme with Javari AI.
            </p>
            <Link
              href="/create/chat?template=rpg"
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
