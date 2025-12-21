'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';

// Game configuration
const GRID_SIZE = 8;
const TILE_SIZE = 60;
const TILE_COLORS = [
  { name: 'red', color: '#ef4444', emoji: '🔴' },
  { name: 'blue', color: '#3b82f6', emoji: '🔵' },
  { name: 'green', color: '#22c55e', emoji: '🟢' },
  { name: 'yellow', color: '#eab308', emoji: '🟡' },
  { name: 'purple', color: '#a855f7', emoji: '🟣' },
];

interface Tile {
  id: string;
  colorIndex: number;
  row: number;
  col: number;
  isMatched: boolean;
  isSelected: boolean;
}

export default function Match3Template() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [selectedTile, setSelectedTile] = useState<{row: number, col: number} | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [level, setLevel] = useState(1);
  const [targetScore, setTargetScore] = useState(1000);
  const [isAnimating, setIsAnimating] = useState(false);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize grid
  const initializeGrid = useCallback(() => {
    const newGrid: Tile[][] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        let colorIndex: number;
        // Avoid initial matches
        do {
          colorIndex = Math.floor(Math.random() * TILE_COLORS.length);
        } while (
          (col >= 2 && 
           newGrid[row][col-1]?.colorIndex === colorIndex && 
           newGrid[row][col-2]?.colorIndex === colorIndex) ||
          (row >= 2 && 
           newGrid[row-1]?.[col]?.colorIndex === colorIndex && 
           newGrid[row-2]?.[col]?.colorIndex === colorIndex)
        );

        newGrid[row][col] = {
          id: `${row}-${col}-${Date.now()}-${Math.random()}`,
          colorIndex,
          row,
          col,
          isMatched: false,
          isSelected: false,
        };
      }
    }
    return newGrid;
  }, []);

  // Start game
  const startGame = () => {
    setGrid(initializeGrid());
    setScore(0);
    setMoves(30);
    setLevel(1);
    setTargetScore(1000);
    setCombo(0);
    setGameOver(false);
    setGameWon(false);
    setIsPlaying(true);
    setSelectedTile(null);
  };

  // Check for matches
  const findMatches = useCallback((currentGrid: Tile[][]): Set<string> => {
    const matches = new Set<string>();

    // Check horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        const color = currentGrid[row][col].colorIndex;
        if (
          currentGrid[row][col + 1].colorIndex === color &&
          currentGrid[row][col + 2].colorIndex === color
        ) {
          matches.add(`${row}-${col}`);
          matches.add(`${row}-${col + 1}`);
          matches.add(`${row}-${col + 2}`);
          // Check for 4+ matches
          if (col + 3 < GRID_SIZE && currentGrid[row][col + 3].colorIndex === color) {
            matches.add(`${row}-${col + 3}`);
          }
          if (col + 4 < GRID_SIZE && currentGrid[row][col + 4].colorIndex === color) {
            matches.add(`${row}-${col + 4}`);
          }
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        const color = currentGrid[row][col].colorIndex;
        if (
          currentGrid[row + 1][col].colorIndex === color &&
          currentGrid[row + 2][col].colorIndex === color
        ) {
          matches.add(`${row}-${col}`);
          matches.add(`${row + 1}-${col}`);
          matches.add(`${row + 2}-${col}`);
          // Check for 4+ matches
          if (row + 3 < GRID_SIZE && currentGrid[row + 3][col].colorIndex === color) {
            matches.add(`${row + 3}-${col}`);
          }
          if (row + 4 < GRID_SIZE && currentGrid[row + 4][col].colorIndex === color) {
            matches.add(`${row + 4}-${col}`);
          }
        }
      }
    }

    return matches;
  }, []);

  // Remove matches and drop tiles
  const processMatches = useCallback(async (currentGrid: Tile[][], currentCombo: number = 0) => {
    const matches = findMatches(currentGrid);
    
    if (matches.size === 0) {
      setCombo(0);
      return currentGrid;
    }

    setIsAnimating(true);
    const newCombo = currentCombo + 1;
    setCombo(newCombo);

    // Mark matched tiles
    const markedGrid = currentGrid.map(row => 
      row.map(tile => ({
        ...tile,
        isMatched: matches.has(`${tile.row}-${tile.col}`)
      }))
    );
    setGrid(markedGrid);

    // Calculate score
    const matchScore = matches.size * 10 * newCombo;
    setScore(prev => prev + matchScore);

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 300));

    // Remove matched tiles and drop
    const droppedGrid: Tile[][] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      const column: Tile[] = [];
      // Collect non-matched tiles from bottom to top
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (!markedGrid[row][col].isMatched) {
          column.unshift(markedGrid[row][col]);
        }
      }
      // Fill from top with new tiles
      while (column.length < GRID_SIZE) {
        column.unshift({
          id: `new-${col}-${Date.now()}-${Math.random()}`,
          colorIndex: Math.floor(Math.random() * TILE_COLORS.length),
          row: 0,
          col,
          isMatched: false,
          isSelected: false,
        });
      }
      droppedGrid.push(column);
    }

    // Transpose back to row-major and update positions
    const finalGrid: Tile[][] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      finalGrid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        finalGrid[row][col] = {
          ...droppedGrid[col][row],
          row,
          col,
        };
      }
    }

    setGrid(finalGrid);

    // Wait for drop animation
    await new Promise(resolve => setTimeout(resolve, 300));

    // Check for cascading matches
    const result = await processMatches(finalGrid, newCombo);
    setIsAnimating(false);
    return result;
  }, [findMatches]);

  // Swap tiles
  const swapTiles = useCallback(async (row1: number, col1: number, row2: number, col2: number) => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Create swapped grid
    const newGrid = grid.map(row => row.map(tile => ({ ...tile, isSelected: false })));
    const temp = { ...newGrid[row1][col1] };
    newGrid[row1][col1] = { ...newGrid[row2][col2], row: row1, col: col1 };
    newGrid[row2][col2] = { ...temp, row: row2, col: col2 };

    // Check if swap creates a match
    const matches = findMatches(newGrid);

    if (matches.size > 0) {
      setGrid(newGrid);
      setMoves(prev => prev - 1);
      
      // Wait for swap animation
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Process matches
      await processMatches(newGrid);
    } else {
      // Invalid swap - swap back
      setGrid(grid.map(row => row.map(tile => ({ ...tile, isSelected: false }))));
    }

    setSelectedTile(null);
    setIsAnimating(false);
  }, [grid, isAnimating, findMatches, processMatches]);

  // Handle tile click
  const handleTileClick = (row: number, col: number) => {
    if (isAnimating || gameOver || gameWon) return;

    if (selectedTile === null) {
      // Select tile
      const newGrid = grid.map((r, ri) => 
        r.map((tile, ci) => ({
          ...tile,
          isSelected: ri === row && ci === col
        }))
      );
      setGrid(newGrid);
      setSelectedTile({ row, col });
    } else {
      // Check if adjacent
      const isAdjacent = 
        (Math.abs(selectedTile.row - row) === 1 && selectedTile.col === col) ||
        (Math.abs(selectedTile.col - col) === 1 && selectedTile.row === row);

      if (isAdjacent) {
        swapTiles(selectedTile.row, selectedTile.col, row, col);
      } else {
        // Select new tile
        const newGrid = grid.map((r, ri) => 
          r.map((tile, ci) => ({
            ...tile,
            isSelected: ri === row && ci === col
          }))
        );
        setGrid(newGrid);
        setSelectedTile({ row, col });
      }
    }
  };

  // Check win/lose conditions
  useEffect(() => {
    if (!isPlaying) return;

    if (score >= targetScore) {
      setGameWon(true);
    } else if (moves <= 0 && !isAnimating) {
      setGameOver(true);
    }
  }, [score, moves, targetScore, isPlaying, isAnimating]);

  // Next level
  const nextLevel = () => {
    setLevel(prev => prev + 1);
    setTargetScore(prev => prev + 500);
    setMoves(30);
    setGrid(initializeGrid());
    setGameWon(false);
    setScore(0);
    setCombo(0);
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
            Template: Match-3 Puzzle
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Game Info */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">💎 Gem Crusher</h1>
          <p className="text-gray-400">Match 3 or more gems to score! Reach the target before running out of moves.</p>
        </div>

        {/* Game Stats */}
        {isPlaying && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-sm text-gray-400">Score</div>
              <div className="text-2xl font-bold text-yellow-400">{score}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-sm text-gray-400">Target</div>
              <div className="text-2xl font-bold text-green-400">{targetScore}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-sm text-gray-400">Moves</div>
              <div className={`text-2xl font-bold ${moves <= 5 ? 'text-red-400' : 'text-blue-400'}`}>{moves}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-sm text-gray-400">Level</div>
              <div className="text-2xl font-bold text-purple-400">{level}</div>
            </div>
          </div>
        )}

        {/* Combo indicator */}
        {combo > 1 && (
          <div className="text-center mb-4 animate-bounce">
            <span className="text-2xl font-bold text-orange-400">
              🔥 {combo}x COMBO!
            </span>
          </div>
        )}

        {/* Game Container */}
        <div className="flex justify-center mb-6">
          <div className="bg-black/50 rounded-2xl p-4 backdrop-blur-sm">
            {!isPlaying ? (
              // Start Screen
              <div 
                className="flex flex-col items-center justify-center"
                style={{ width: GRID_SIZE * TILE_SIZE + 20, height: GRID_SIZE * TILE_SIZE + 20 }}
              >
                <h2 className="text-4xl font-bold mb-4">💎 Gem Crusher</h2>
                <p className="text-gray-400 mb-6 text-center">
                  Swap gems to match 3 or more.<br/>
                  Create combos for bonus points!
                </p>
                <button
                  onClick={startGame}
                  className="flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  <Play className="w-6 h-6" />
                  START GAME
                </button>
              </div>
            ) : (
              // Game Grid
              <div 
                className="relative"
                style={{ 
                  width: GRID_SIZE * TILE_SIZE, 
                  height: GRID_SIZE * TILE_SIZE,
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((tile) => (
                    <button
                      key={tile.id}
                      onClick={() => handleTileClick(rowIndex, tile.col)}
                      disabled={isAnimating}
                      className={`absolute rounded-lg transition-all duration-200 flex items-center justify-center text-2xl
                        ${tile.isSelected ? 'ring-4 ring-white scale-110 z-10' : ''}
                        ${tile.isMatched ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
                        hover:brightness-125 active:scale-95
                      `}
                      style={{
                        width: TILE_SIZE - 4,
                        height: TILE_SIZE - 4,
                        left: tile.col * TILE_SIZE + 2,
                        top: tile.row * TILE_SIZE + 2,
                        backgroundColor: TILE_COLORS[tile.colorIndex].color,
                        boxShadow: `0 4px 0 ${TILE_COLORS[tile.colorIndex].color}88`,
                      }}
                    >
                      <span className="drop-shadow-lg">{TILE_COLORS[tile.colorIndex].emoji}</span>
                    </button>
                  ))
                )}

                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-xl">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-red-400 mb-2">Game Over!</h2>
                      <p className="text-xl mb-4">Final Score: {score}</p>
                      <button
                        onClick={startGame}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Level Complete Overlay */}
                {gameWon && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-xl">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-green-400 mb-2">🎉 Level Complete!</h2>
                      <p className="text-xl mb-4">Score: {score}</p>
                      <button
                        onClick={nextLevel}
                        className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors"
                      >
                        Next Level
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        {isPlaying && (
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Restart
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="p-6 bg-white/5 rounded-xl mb-6">
          <h3 className="font-semibold mb-2">How to Play</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Click a gem to select it, then click an adjacent gem to swap</li>
            <li>• Match 3 or more gems of the same color to score</li>
            <li>• Create chain reactions (combos) for bonus points</li>
            <li>• Reach the target score before running out of moves</li>
          </ul>
        </div>

        {/* Customize CTA */}
        <div className="p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold mb-2">Make it yours!</h3>
          <p className="text-gray-400 mb-4">
            Change colors, add power-ups, or create themed versions with Javari AI.
          </p>
          <Link
            href="/create/chat?template=match3"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors"
          >
            Customize with AI
          </Link>
        </div>
      </div>
    </div>
  );
}
