'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Heart,
  Share2,
  Flag,
  Star,
  MessageCircle,
  Users,
  Eye,
  Trophy,
  ThumbsUp,
  Send,
  MoreVertical,
  Volume2,
  VolumeX,
  Gamepad2,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

// Mock game data
const GAME = {
  id: 'cosmic-runner',
  title: 'Cosmic Runner',
  creator: {
    name: 'StarGamesDev',
    avatar: '👨‍🚀',
    followers: 8420,
    games: 12,
    isPro: true,
  },
  stats: {
    plays: 450000,
    likes: 28500,
    rating: 4.9,
    reviews: 1250,
  },
  description: `🚀 Cosmic Runner is an addictive endless runner set in deep space! 

Dodge asteroids, collect power-ups, and race through stunning cosmic environments. Features:

• 🌟 Beautiful procedural space backgrounds
• 💫 Multiple power-ups (Shield, Magnet, x2 Score)
• 🏆 Global leaderboards
• 🎵 Epic synthwave soundtrack
• 📱 Works on mobile and desktop

How far can you run?`,
  tags: ['endless-runner', 'space', 'arcade', 'casual'],
  publishedAt: '2025-11-15',
};

const COMMENTS = [
  { id: 1, user: 'GamerPro99', avatar: '🎮', text: 'This game is absolutely addicting! Love the smooth controls.', likes: 45, time: '2 hours ago' },
  { id: 2, user: 'SpaceExplorer', avatar: '🚀', text: 'Best endless runner I\'ve played in a while. The graphics are stunning!', likes: 32, time: '5 hours ago' },
  { id: 3, user: 'CasualPlayer', avatar: '😊', text: 'Perfect for quick gaming sessions. My high score is 50,000!', likes: 18, time: '1 day ago' },
  { id: 4, user: 'RetroFan', avatar: '👾', text: 'The synthwave soundtrack is amazing. Gives me Tron vibes!', likes: 27, time: '2 days ago' },
];

const SIMILAR_GAMES = [
  { id: 1, title: 'Neon Drift', creator: 'SpeedDemon', plays: 240000, thumbnail: '🏎️', color: 'from-cyan-600 to-blue-600' },
  { id: 2, title: 'Galaxy Blast', creator: 'StarGamesDev', plays: 180000, thumbnail: '💥', color: 'from-purple-600 to-pink-600' },
  { id: 3, title: 'Pixel Jump', creator: 'PixelPro', plays: 130000, thumbnail: '🎮', color: 'from-green-600 to-teal-600' },
];

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export default function PlayPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [comment, setComment] = useState('');
  const [viewCount, setViewCount] = useState(GAME.stats.plays);

  // Simulate view count increasing
  useEffect(() => {
    const interval = setInterval(() => {
      setViewCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Game Container */}
      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Game Header (hidden in fullscreen) */}
        {!isFullscreen && (
          <div className="bg-black/50 border-b border-white/10 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link href="/marketplace" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
                Back to Games
              </Link>
              <h1 className="text-lg font-bold">{GAME.title}</h1>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-green-400">
                  <Eye className="w-4 h-4" />
                  {formatNumber(viewCount)} playing
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Game Frame */}
        <div className={`relative bg-black ${isFullscreen ? 'w-full h-full' : 'aspect-video max-h-[70vh]'}`}>
          {/* Placeholder for game iframe */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50">
            {!isPlaying ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="text-8xl mb-6">🚀</div>
                <h2 className="text-4xl font-bold mb-4">{GAME.title}</h2>
                <p className="text-gray-400 mb-8">Click Play to start your cosmic journey!</p>
                <button
                  onClick={() => setIsPlaying(true)}
                  className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-2xl font-bold text-xl flex items-center gap-3 mx-auto transition-all transform hover:scale-105 shadow-lg shadow-green-500/30"
                >
                  <Play className="w-8 h-8" />
                  PLAY NOW
                </button>
              </motion.div>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-gray-400">Game running...</p>
                <p className="text-sm text-gray-500 mt-2">(Game would be embedded here)</p>
              </div>
            )}
          </div>

          {/* Game Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Actions */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{GAME.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Play className="w-4 h-4" />
                    {formatNumber(GAME.stats.plays)} plays
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {GAME.stats.rating} ({formatNumber(GAME.stats.reviews)} reviews)
                  </span>
                  <span>Published {new Date(GAME.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isLiked 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-400' : ''}`} />
                  {formatNumber(GAME.stats.likes + (isLiked ? 1 : 0))}
                </button>
                <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl">
                  <Flag className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Creator Card */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center text-3xl">
                    {GAME.creator.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{GAME.creator.name}</span>
                      {GAME.creator.isPro && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-black">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {GAME.creator.games} games • {formatNumber(GAME.creator.followers)} followers
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                    isFollowing 
                      ? 'bg-white/10 border border-white/20' 
                      : 'bg-purple-600 hover:bg-purple-500'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <h2 className="text-lg font-bold mb-4">About this game</h2>
              <div className="whitespace-pre-wrap text-gray-300">{GAME.description}</div>
              <div className="flex flex-wrap gap-2 mt-4">
                {GAME.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comments ({COMMENTS.length})
                </h2>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  {showComments ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Comment Input */}
              <div className="flex gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center text-lg">
                  👤
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <AnimatePresence>
                {showComments && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {COMMENTS.map((c, i) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center text-lg flex-shrink-0">
                          {c.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{c.user}</span>
                            <span className="text-xs text-gray-500">{c.time}</span>
                          </div>
                          <p className="text-gray-300">{c.text}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-white">
                              <ThumbsUp className="w-4 h-4" />
                              {c.likes}
                            </button>
                            <button className="text-sm text-gray-500 hover:text-white">Reply</button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Stats */}
            <div className="p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/20">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Game Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Plays</span>
                  <span className="font-bold">{formatNumber(GAME.stats.plays)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating</span>
                  <span className="font-bold flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {GAME.stats.rating}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Likes</span>
                  <span className="font-bold">{formatNumber(GAME.stats.likes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reviews</span>
                  <span className="font-bold">{formatNumber(GAME.stats.reviews)}</span>
                </div>
              </div>
            </div>

            {/* Similar Games */}
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-bold mb-4">Similar Games</h3>
              <div className="space-y-3">
                {SIMILAR_GAMES.map(game => (
                  <Link key={game.id} href={`/play/${game.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center text-xl`}>
                        {game.thumbnail}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{game.title}</h4>
                        <p className="text-xs text-gray-500">{game.creator}</p>
                      </div>
                      <span className="text-xs text-gray-400">{formatNumber(game.plays)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="p-6 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl border border-green-500/20 text-center">
              <Sparkles className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Create your own!</h3>
              <p className="text-sm text-gray-400 mb-4">Build amazing games like this with AI</p>
              <Link
                href="/create/chat"
                className="block w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold"
              >
                Start Creating
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
