'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Gamepad2,
  DollarSign,
  Users,
  TrendingUp,
  Play,
  Heart,
  Star,
  Eye,
  Plus,
  Settings,
  Download,
  Share2,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  Sparkles,
  ChevronRight,
  BarChart3
} from 'lucide-react';

// Mock data
const STATS = {
  totalPlays: 156420,
  totalRevenue: 1847.50,
  totalGames: 5,
  followers: 2340,
  playsChange: 12.5,
  revenueChange: 8.3,
};

const MY_GAMES = [
  {
    id: 'cosmic-runner',
    title: 'Cosmic Runner',
    status: 'published',
    plays: 125000,
    revenue: 1250.00,
    rating: 4.9,
    likes: 8500,
    thumbnail: '🚀',
    color: 'from-purple-600 to-blue-600',
    publishedAt: '2025-11-15',
  },
  {
    id: 'gem-quest',
    title: 'Gem Quest Saga',
    status: 'published',
    plays: 28000,
    revenue: 420.00,
    rating: 4.6,
    likes: 1800,
    thumbnail: '💎',
    color: 'from-pink-600 to-red-600',
    publishedAt: '2025-12-01',
  },
  {
    id: 'space-defender',
    title: 'Space Defender X',
    status: 'draft',
    plays: 0,
    revenue: 0,
    rating: 0,
    likes: 0,
    thumbnail: '🛸',
    color: 'from-cyan-600 to-blue-600',
    publishedAt: null,
  },
  {
    id: 'puzzle-master',
    title: 'Puzzle Master 3000',
    status: 'review',
    plays: 0,
    revenue: 0,
    rating: 0,
    likes: 0,
    thumbnail: '🧩',
    color: 'from-green-600 to-teal-600',
    publishedAt: null,
  },
];

const RECENT_ACTIVITY = [
  { type: 'play', game: 'Cosmic Runner', count: 1250, time: '2 hours ago' },
  { type: 'revenue', amount: 12.50, time: '3 hours ago' },
  { type: 'like', game: 'Gem Quest Saga', count: 45, time: '5 hours ago' },
  { type: 'follower', count: 12, time: '8 hours ago' },
  { type: 'review', game: 'Cosmic Runner', rating: 5, time: '12 hours ago' },
];

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatCurrency = (num: number): string => {
  return '$' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function DashboardPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-900">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-black/50 border-r border-white/10 p-4">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Gamepad2 className="w-8 h-8 text-purple-400" />
          <span className="text-xl font-bold">Game Studio</span>
        </Link>

        <nav className="space-y-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
            { icon: Gamepad2, label: 'My Games', href: '/dashboard/games', active: false },
            { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics', active: false },
            { icon: DollarSign, label: 'Earnings', href: '/dashboard/earnings', active: false },
            { icon: Users, label: 'Followers', href: '/dashboard/followers', active: false },
            { icon: Settings, label: 'Settings', href: '/dashboard/settings', active: false },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                item.active 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link
            href="/create/chat"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold transition-all"
          >
            <Plus className="w-5 h-5" />
            Create New Game
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here's your game studio overview.</p>
          </div>

          <div className="flex items-center gap-3">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedTimeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white/5 rounded-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Play className="w-6 h-6 text-green-400" />
              </div>
              <span className={`flex items-center gap-1 text-sm ${STATS.playsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {STATS.playsChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(STATS.playsChange)}%
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{formatNumber(STATS.totalPlays)}</div>
            <div className="text-gray-400 text-sm">Total Plays</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-white/5 rounded-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <DollarSign className="w-6 h-6 text-yellow-400" />
              </div>
              <span className={`flex items-center gap-1 text-sm ${STATS.revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {STATS.revenueChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(STATS.revenueChange)}%
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(STATS.totalRevenue)}</div>
            <div className="text-gray-400 text-sm">Total Revenue</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white/5 rounded-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Gamepad2 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{STATS.totalGames}</div>
            <div className="text-gray-400 text-sm">Published Games</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white/5 rounded-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{formatNumber(STATS.followers)}</div>
            <div className="text-gray-400 text-sm">Followers</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* My Games */}
          <div className="col-span-2 bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">My Games</h2>
              <Link href="/dashboard/games" className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {MY_GAMES.map(game => (
                <div
                  key={game.id}
                  className="flex items-center gap-4 p-4 bg-black/30 rounded-xl hover:bg-black/50 transition-colors"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl`}>
                    {game.thumbnail}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{game.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        game.status === 'published' ? 'bg-green-500/20 text-green-400' :
                        game.status === 'review' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {game.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" /> {formatNumber(game.plays)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> {formatCurrency(game.revenue)}
                      </span>
                      {game.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" /> {game.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Share2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>

            <div className="space-y-4">
              {RECENT_ACTIVITY.map((activity, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-black/30 rounded-xl">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'play' ? 'bg-green-500/20' :
                    activity.type === 'revenue' ? 'bg-yellow-500/20' :
                    activity.type === 'like' ? 'bg-red-500/20' :
                    activity.type === 'follower' ? 'bg-blue-500/20' :
                    'bg-purple-500/20'
                  }`}>
                    {activity.type === 'play' && <Play className="w-4 h-4 text-green-400" />}
                    {activity.type === 'revenue' && <DollarSign className="w-4 h-4 text-yellow-400" />}
                    {activity.type === 'like' && <Heart className="w-4 h-4 text-red-400" />}
                    {activity.type === 'follower' && <Users className="w-4 h-4 text-blue-400" />}
                    {activity.type === 'review' && <Star className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      {activity.type === 'play' && `${formatNumber(activity.count)} new plays on ${activity.game}`}
                      {activity.type === 'revenue' && `Earned ${formatCurrency(activity.amount)}`}
                      {activity.type === 'like' && `${activity.count} new likes on ${activity.game}`}
                      {activity.type === 'follower' && `${activity.count} new followers`}
                      {activity.type === 'review' && `New ${activity.rating}★ review on ${activity.game}`}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Earnings Card */}
        <div className="mt-6 p-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-2xl border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-yellow-400" />
                Available for Withdrawal
              </h3>
              <p className="text-3xl font-bold text-yellow-400">{formatCurrency(STATS.totalRevenue * 0.7)}</p>
              <p className="text-sm text-gray-400 mt-1">70% creator share • Next payout: Jan 1, 2026</p>
            </div>
            <button className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors">
              Withdraw Funds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
