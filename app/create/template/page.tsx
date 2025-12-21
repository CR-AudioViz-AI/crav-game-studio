'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Play, 
  Wand2, 
  Star, 
  Users, 
  Clock,
  Filter,
  Search
} from 'lucide-react';

// Template definitions
const TEMPLATES = [
  {
    id: 'platformer',
    title: 'Pixel Adventure',
    type: 'Platformer',
    description: 'Classic side-scrolling platformer with jumping, collecting coins, and avoiding enemies.',
    difficulty: 'Beginner',
    playTime: '5-10 min',
    features: ['Jump mechanics', 'Coin collection', 'Enemy AI', 'Multiple levels'],
    color: 'from-blue-500 to-cyan-500',
    emoji: '🎮',
    plays: 15420,
    rating: 4.8,
  },
  {
    id: 'match3',
    title: 'Gem Crusher',
    type: 'Puzzle',
    description: 'Addictive match-3 puzzle game. Swap gems to match colors and score big combos!',
    difficulty: 'Beginner',
    playTime: '2-5 min',
    features: ['Match-3 mechanics', 'Combo system', 'Level progression', 'Score tracking'],
    color: 'from-purple-500 to-pink-500',
    emoji: '💎',
    plays: 23150,
    rating: 4.9,
  },
  {
    id: 'shooter',
    title: 'Galactic Defender',
    type: 'Shooter',
    description: 'Fast-paced space shooter with power-ups, enemy waves, and intense action.',
    difficulty: 'Intermediate',
    playTime: '5-15 min',
    features: ['Shooting mechanics', 'Power-ups', 'Wave system', 'Boss battles'],
    color: 'from-red-500 to-orange-500',
    emoji: '🚀',
    plays: 18320,
    rating: 4.7,
  },
  {
    id: 'racing',
    title: 'Neon Racer',
    type: 'Racing',
    description: 'High-speed racing with boosts, obstacles, and dynamic tracks.',
    difficulty: 'Intermediate',
    playTime: '3-5 min',
    features: ['Vehicle physics', 'Boost system', 'Obstacle avoidance', 'Lap times'],
    color: 'from-green-500 to-emerald-500',
    emoji: '🏎️',
    plays: 12840,
    rating: 4.6,
    comingSoon: true,
  },
  {
    id: 'rpg',
    title: 'Quest for Glory',
    type: 'RPG',
    description: 'Classic turn-based RPG with battles, inventory, and character progression.',
    difficulty: 'Advanced',
    playTime: '15-30 min',
    features: ['Turn-based combat', 'Inventory system', 'Level up', 'Story mode'],
    color: 'from-yellow-500 to-amber-500',
    emoji: '⚔️',
    plays: 9560,
    rating: 4.8,
    comingSoon: true,
  },
  {
    id: 'tower-defense',
    title: 'Tower Master',
    type: 'Strategy',
    description: 'Strategic tower defense with upgrades, waves, and multiple tower types.',
    difficulty: 'Intermediate',
    playTime: '10-20 min',
    features: ['Tower placement', 'Upgrade system', 'Wave mechanics', 'Strategic depth'],
    color: 'from-indigo-500 to-violet-500',
    emoji: '🏰',
    plays: 11230,
    rating: 4.5,
    comingSoon: true,
  },
  {
    id: 'endless-runner',
    title: 'Jungle Run',
    type: 'Endless Runner',
    description: 'Endless running with obstacles, power-ups, and increasing speed.',
    difficulty: 'Beginner',
    playTime: '1-3 min',
    features: ['Auto-run', 'Jump/slide', 'Power-ups', 'High scores'],
    color: 'from-teal-500 to-cyan-500',
    emoji: '🏃',
    plays: 21450,
    rating: 4.7,
    comingSoon: true,
  },
  {
    id: 'quiz',
    title: 'Brain Blast',
    type: 'Quiz/Trivia',
    description: 'Customizable trivia game with multiple categories and difficulty levels.',
    difficulty: 'Beginner',
    playTime: '5-10 min',
    features: ['Multiple choice', 'Categories', 'Timer', 'Leaderboards'],
    color: 'from-pink-500 to-rose-500',
    emoji: '🧠',
    plays: 14680,
    rating: 4.6,
    comingSoon: true,
  },
  {
    id: 'card-game',
    title: 'Card Battle',
    type: 'Card Game',
    description: 'Strategic card game with deck building and turn-based battles.',
    difficulty: 'Intermediate',
    playTime: '5-15 min',
    features: ['Card mechanics', 'Deck building', 'AI opponent', 'Multiplayer'],
    color: 'from-gray-500 to-slate-500',
    emoji: '🃏',
    plays: 8920,
    rating: 4.4,
    comingSoon: true,
  },
  {
    id: 'idle',
    title: 'Cookie Empire',
    type: 'Idle/Clicker',
    description: 'Addictive idle game with upgrades, automation, and passive progression.',
    difficulty: 'Beginner',
    playTime: 'Endless',
    features: ['Click mechanics', 'Upgrades', 'Automation', 'Offline progress'],
    color: 'from-amber-500 to-yellow-500',
    emoji: '🍪',
    plays: 32100,
    rating: 4.5,
    comingSoon: true,
  },
];

const CATEGORIES = ['All', 'Platformer', 'Puzzle', 'Shooter', 'Racing', 'RPG', 'Strategy', 'Educational'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function TemplateBrowserPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Filter templates
  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.type === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Game Templates</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start with a professional template and customize it with Javari AI.
            Every template is fully playable and ready to modify.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-3 bg-white/10 rounded-xl"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>

            {/* Desktop filters */}
            <div className="hidden md:flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {DIFFICULTIES.map(diff => (
                  <option key={diff} value={diff} className="bg-gray-900">{diff}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile filters */}
          {showFilters && (
            <div className="md:hidden mt-4 flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/10 rounded-xl"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/10 rounded-xl"
              >
                {DIFFICULTIES.map(diff => (
                  <option key={diff} value={diff} className="bg-gray-900">{diff}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-gray-400 mb-6">
          Showing {filteredTemplates.length} of {TEMPLATES.length} templates
        </p>

        {/* Template Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all group">
                {/* Preview */}
                <div className={`aspect-video bg-gradient-to-br ${template.color} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl">{template.emoji}</span>
                  </div>
                  
                  {/* Coming Soon badge */}
                  {template.comingSoon && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium">
                      Coming Soon
                    </div>
                  )}

                  {/* Hover overlay */}
                  {!template.comingSoon && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <Link
                        href={`/templates/${template.id}`}
                        className="px-4 py-2 bg-green-500 hover:bg-green-400 rounded-lg font-semibold flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Play
                      </Link>
                      <Link
                        href={`/create/chat?template=${template.id}`}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold flex items-center gap-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        Customize
                      </Link>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{template.title}</h3>
                      <p className="text-sm text-purple-400">{template.type}</p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">{template.rating}</span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {(template.plays / 1000).toFixed(1)}K plays
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {template.playTime}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.features.slice(0, 3).map((feature, j) => (
                      <span
                        key={j}
                        className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300"
                      >
                        {feature}
                      </span>
                    ))}
                    {template.features.length > 3 && (
                      <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-500">
                        +{template.features.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Difficulty badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      template.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                      template.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {template.difficulty}
                    </span>

                    {!template.comingSoon && (
                      <Link
                        href={`/templates/${template.id}`}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                      >
                        Try now →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No templates found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
              className="text-purple-400 hover:text-purple-300"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 p-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl border border-white/10 text-center">
          <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Describe your dream game to Javari AI and we'll build it from scratch.
            Any genre, any style, any complexity.
          </p>
          <Link
            href="/create/chat"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold text-lg transition-all transform hover:scale-105"
          >
            <Wand2 className="w-5 h-5" />
            Create Custom Game
          </Link>
        </div>
      </div>
    </div>
  );
}
