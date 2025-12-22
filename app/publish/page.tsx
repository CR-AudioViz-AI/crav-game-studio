'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Upload,
  Image,
  Tag,
  DollarSign,
  Globe,
  Lock,
  Check,
  AlertCircle,
  Sparkles,
  Play,
  Eye,
  Settings,
  ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  'Platformer', 'Puzzle', 'Shooter', 'Racing', 'RPG', 
  'Strategy', 'Idle', 'Quiz', 'Card Game', 'Adventure'
];

const MONETIZATION_OPTIONS = [
  { 
    id: 'free', 
    title: 'Free to Play', 
    description: 'Anyone can play for free. Earn from ads.', 
    revenue: 'Ad revenue share (70/30)',
    icon: '🆓'
  },
  { 
    id: 'premium', 
    title: 'Premium', 
    description: 'Players pay credits to play.', 
    revenue: 'Credit revenue share (70/30)',
    icon: '💎'
  },
  { 
    id: 'freemium', 
    title: 'Freemium', 
    description: 'Free to play with optional purchases.', 
    revenue: 'IAP + Ad revenue share (70/30)',
    icon: '🎁'
  },
];

export default function PublishPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    monetization: 'free',
    visibility: 'public',
    ageRating: 'everyone',
  });
  const [newTag, setNewTag] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const handleAddTag = () => {
    if (newTag && formData.tags.length < 5 && !formData.tags.includes(newTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate publishing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsPublishing(false);
    setIsPublished(true);
  };

  const canProceed = () => {
    if (step === 1) return formData.title.length >= 3 && formData.description.length >= 20 && formData.category;
    if (step === 2) return true;
    if (step === 3) return true;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/30 to-gray-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold">Publish Your Game</h1>
          <div className="w-32" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                s < step ? 'bg-green-500 text-white' :
                s === step ? 'bg-purple-600 text-white' :
                'bg-white/10 text-gray-400'
              }`}>
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-20 h-1 transition-colors ${
                  s < step ? 'bg-green-500' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between mb-8 text-sm text-gray-400">
          <span className={step >= 1 ? 'text-white' : ''}>Details</span>
          <span className={step >= 2 ? 'text-white' : ''}>Monetization</span>
          <span className={step >= 3 ? 'text-white' : ''}>Settings</span>
          <span className={step >= 4 ? 'text-white' : ''}>Review</span>
        </div>

        {/* Success State */}
        {isPublished ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-4">Your Game is Live!</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Congratulations! Your game has been published to the marketplace.
              Players can now discover and play it.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/marketplace"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold flex items-center gap-2"
              >
                <Globe className="w-5 h-5" />
                View in Marketplace
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold"
              >
                Back to Dashboard
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Step 1: Details */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <h2 className="text-xl font-bold mb-6">Game Details</h2>

                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Game Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter your game title"
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your game..."
                        rows={4}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <div className="grid grid-cols-5 gap-2">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                              formData.category === cat
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Tags (up to 5)</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                          placeholder="Add a tag"
                          className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={handleAddTag}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm flex items-center gap-2"
                          >
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-white">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Monetization */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <h2 className="text-xl font-bold mb-6">Monetization</h2>

                  <div className="space-y-4">
                    {MONETIZATION_OPTIONS.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setFormData(prev => ({ ...prev, monetization: option.id }))}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${
                          formData.monetization === option.id
                            ? 'bg-purple-600/20 border-purple-500'
                            : 'bg-black/30 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{option.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-bold">{option.title}</h3>
                            <p className="text-sm text-gray-400">{option.description}</p>
                            <p className="text-sm text-green-400 mt-1">{option.revenue}</p>
                          </div>
                          {formData.monetization === option.id && (
                            <Check className="w-6 h-6 text-purple-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-400">Revenue Share</h4>
                        <p className="text-sm text-gray-300">
                          You receive 70% of all revenue generated by your game.
                          CR AudioViz AI retains 30% for platform maintenance and services.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Settings */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <h2 className="text-xl font-bold mb-6">Settings</h2>

                  <div className="space-y-6">
                    {/* Visibility */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Visibility</label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, visibility: 'public' }))}
                          className={`flex-1 p-4 rounded-xl border transition-all ${
                            formData.visibility === 'public'
                              ? 'bg-purple-600/20 border-purple-500'
                              : 'bg-black/30 border-white/10'
                          }`}
                        >
                          <Globe className="w-6 h-6 mb-2" />
                          <h3 className="font-bold">Public</h3>
                          <p className="text-sm text-gray-400">Anyone can find and play</p>
                        </button>
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, visibility: 'unlisted' }))}
                          className={`flex-1 p-4 rounded-xl border transition-all ${
                            formData.visibility === 'unlisted'
                              ? 'bg-purple-600/20 border-purple-500'
                              : 'bg-black/30 border-white/10'
                          }`}
                        >
                          <Lock className="w-6 h-6 mb-2" />
                          <h3 className="font-bold">Unlisted</h3>
                          <p className="text-sm text-gray-400">Only with direct link</p>
                        </button>
                      </div>
                    </div>

                    {/* Age Rating */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Age Rating</label>
                      <select
                        value={formData.ageRating}
                        onChange={(e) => setFormData(prev => ({ ...prev, ageRating: e.target.value }))}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="everyone">Everyone</option>
                        <option value="10+">10+</option>
                        <option value="13+">13+</option>
                        <option value="17+">17+</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <h2 className="text-xl font-bold mb-6">Review & Publish</h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-black/30 rounded-xl">
                      <h3 className="text-sm text-gray-400 mb-1">Title</h3>
                      <p className="font-bold">{formData.title}</p>
                    </div>
                    <div className="p-4 bg-black/30 rounded-xl">
                      <h3 className="text-sm text-gray-400 mb-1">Description</h3>
                      <p>{formData.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-black/30 rounded-xl">
                        <h3 className="text-sm text-gray-400 mb-1">Category</h3>
                        <p className="font-bold">{formData.category}</p>
                      </div>
                      <div className="p-4 bg-black/30 rounded-xl">
                        <h3 className="text-sm text-gray-400 mb-1">Monetization</h3>
                        <p className="font-bold capitalize">{formData.monetization}</p>
                      </div>
                      <div className="p-4 bg-black/30 rounded-xl">
                        <h3 className="text-sm text-gray-400 mb-1">Visibility</h3>
                        <p className="font-bold capitalize">{formData.visibility}</p>
                      </div>
                      <div className="p-4 bg-black/30 rounded-xl">
                        <h3 className="text-sm text-gray-400 mb-1">Age Rating</h3>
                        <p className="font-bold capitalize">{formData.ageRating}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Before Publishing</h4>
                        <p className="text-sm text-gray-300">
                          Make sure your game follows our community guidelines. 
                          Games are reviewed within 24 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              {step > 1 ? (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed()}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold flex items-center gap-2"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="px-8 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-xl font-semibold flex items-center gap-2"
                >
                  {isPublishing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Globe className="w-5 h-5" />
                      Publish Game
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
