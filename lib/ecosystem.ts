// =============================================================================
// CR GAME STUDIO - ECOSYSTEM INTEGRATION
// =============================================================================
// Full integration with CR AudioViz AI platform
// Credits, Payments, Auth, Activity Logging, Support
// =============================================================================

import { createClient } from '@supabase/supabase-js';

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// =============================================================================
// ECOSYSTEM CONFIG - Required for credits, payments, cross-sell
// =============================================================================

export const ECOSYSTEM_CONFIG = {
  appId: 'game-studio',
  appName: 'CR Game Studio',
  
  // Credit packages available for purchase
  creditPackages: [
    { id: 'starter', name: 'Starter', credits: 50, price: 4.99, popular: false },
    { id: 'creator', name: 'Creator', credits: 150, price: 12.99, popular: true },
    { id: 'studio', name: 'Studio', credits: 500, price: 39.99, popular: false },
    { id: 'enterprise', name: 'Enterprise', credits: 2000, price: 149.99, popular: false },
  ],
  
  // Game creation costs
  gameCosts: {
    createSimpleGame: 5,
    createMediumGame: 25,
    createComplexGame: 100,
    generateAssets: 2,
    publishGame: 10,
    playPremiumGame: 2,
  },
  
  // Related apps for cross-selling
  relatedApps: [
    { id: 'logo-studio', name: 'Logo Studio', url: 'https://crav-logo-studio.vercel.app', icon: '🎨' },
    { id: 'scrapbook', name: 'Scrapbook', url: 'https://crav-scrapbook.vercel.app', icon: '📖' },
    { id: 'music-builder', name: 'Music Builder', url: 'https://crav-music-builder.vercel.app', icon: '🎵' },
  ],
  
  // Support contact
  supportEmail: 'support@craudiovizai.com',
  
  // Payment providers
  stripe: {
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
};

// =============================================================================
// CREDIT SYSTEM
// =============================================================================

export interface CreditCosts {
  createSimpleGame: number;
  createMediumGame: number;
  createComplexGame: number;
  generateAssets: number;
  publishGame: number;
  playPremiumGame: number;
}

export const CREDIT_COSTS: CreditCosts = ECOSYSTEM_CONFIG.gameCosts;

export async function checkCredits(userId: string, amount: number): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('id', userId)
    .single();
  
  return data ? data.credits_balance >= amount : false;
}

export async function deductCredits(
  userId: string,
  amount: number,
  operation: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  if (!supabaseAdmin) {
    return { success: false, error: 'Server configuration error' };
  }

  // Check current balance
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('credits_balance')
    .eq('id', userId)
    .single();

  if (!profile) {
    return { success: false, error: 'User not found' };
  }

  if (profile.credits_balance < amount) {
    return { success: false, error: 'Insufficient credits' };
  }

  const newBalance = profile.credits_balance - amount;

  // Update balance
  await supabaseAdmin
    .from('profiles')
    .update({ 
      credits_balance: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  // Log transaction
  await supabaseAdmin
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: -amount,
      transaction_type: 'spend',
      app_id: 'game-studio',
      operation,
      description: `Game Studio: ${operation}`,
      metadata,
    });

  // Log activity
  await logActivity(userId, 'credits_spent', {
    amount,
    operation,
    app: 'game-studio',
    ...metadata,
  });

  return { success: true, newBalance };
}

export async function refundCredits(
  userId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { success: false, error: 'Server configuration error' };
  }

  const { data } = await supabaseAdmin
    .from('profiles')
    .select('credits_balance')
    .eq('id', userId)
    .single();

  if (!data) {
    return { success: false, error: 'User not found' };
  }

  await supabaseAdmin
    .from('profiles')
    .update({ credits_balance: data.credits_balance + amount })
    .eq('id', userId);

  await supabaseAdmin
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount,
      transaction_type: 'refund',
      app_id: 'game-studio',
      description: `Refund: ${reason}`,
    });

  return { success: true };
}

export async function getCreditBalance(userId: string): Promise<number> {
  const { data } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('id', userId)
    .single();

  return data?.credits_balance || 0;
}

// =============================================================================
// AUTHENTICATION
// =============================================================================

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return data;
}

// =============================================================================
// ACTIVITY LOGGING (CRM)
// =============================================================================

export async function logActivity(
  userId: string | null,
  type: string,
  metadata?: Record<string, any>
): Promise<void> {
  if (!supabaseAdmin) return;

  await supabaseAdmin
    .from('activity_logs')
    .insert({
      user_id: userId,
      type,
      app_id: 'game-studio',
      metadata,
      created_at: new Date().toISOString(),
    });
}

// Activity types for Game Studio
export const ACTIVITY_TYPES = {
  GAME_CREATED: 'game_created',
  GAME_PUBLISHED: 'game_published',
  GAME_PLAYED: 'game_played',
  GAME_UPDATED: 'game_updated',
  ASSET_GENERATED: 'asset_generated',
  TEMPLATE_USED: 'template_used',
  CREDITS_SPENT: 'credits_spent',
  REVENUE_EARNED: 'revenue_earned',
};

// =============================================================================
// GAME STORAGE
// =============================================================================

export interface Game {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  thumbnail_url?: string;
  game_data: Record<string, any>;
  is_published: boolean;
  is_premium: boolean;
  credit_cost: number;
  play_count: number;
  rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export async function saveGame(game: Partial<Game>): Promise<Game | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('games')
    .upsert(game)
    .select()
    .single();

  if (error) {
    console.error('Error saving game:', error);
    return null;
  }

  return data;
}

export async function getGame(gameId: string): Promise<Game | null> {
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  return data;
}

export async function getUserGames(userId: string): Promise<Game[]> {
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('creator_id', userId)
    .order('updated_at', { ascending: false });

  return data || [];
}

export async function getPublishedGames(options?: {
  category?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'popular' | 'newest' | 'rating';
}): Promise<Game[]> {
  let query = supabase
    .from('games')
    .select('*')
    .eq('is_published', true);

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  switch (options?.sortBy) {
    case 'popular':
      query = query.order('play_count', { ascending: false });
      break;
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('published_at', { ascending: false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data } = await query;
  return data || [];
}

// =============================================================================
// REVENUE TRACKING
// =============================================================================

export async function recordGamePlay(
  gameId: string,
  playerId: string,
  creatorId: string,
  creditCost: number
): Promise<void> {
  if (!supabaseAdmin) return;

  // Increment play count
  await supabaseAdmin.rpc('increment_play_count', { game_id: gameId });

  // If premium game, record revenue
  if (creditCost > 0) {
    const creatorShare = Math.floor(creditCost * 0.7); // 70% to creator
    const platformShare = creditCost - creatorShare;   // 30% to platform

    // Add credits to creator
    const { data: creator } = await supabaseAdmin
      .from('profiles')
      .select('credits_balance')
      .eq('id', creatorId)
      .single();

    if (creator) {
      await supabaseAdmin
        .from('profiles')
        .update({ credits_balance: creator.credits_balance + creatorShare })
        .eq('id', creatorId);

      await supabaseAdmin
        .from('credit_transactions')
        .insert({
          user_id: creatorId,
          amount: creatorShare,
          transaction_type: 'revenue',
          app_id: 'game-studio',
          description: `Revenue from game play`,
          metadata: { game_id: gameId, player_id: playerId },
        });
    }

    // Log revenue activity
    await logActivity(creatorId, ACTIVITY_TYPES.REVENUE_EARNED, {
      game_id: gameId,
      player_id: playerId,
      total_credits: creditCost,
      creator_share: creatorShare,
      platform_share: platformShare,
    });
  }
}

// =============================================================================
// SUPPORT TICKETS
// =============================================================================

export async function createSupportTicket(
  userId: string,
  subject: string,
  description: string,
  category: 'bug' | 'feature' | 'help' | 'other',
  metadata?: Record<string, any>
): Promise<string | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('support_tickets')
    .insert({
      user_id: userId,
      subject,
      description,
      category,
      app_id: 'game-studio',
      status: 'open',
      metadata,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating ticket:', error);
    return null;
  }

  return data?.id;
}

// =============================================================================
// ENHANCEMENT REQUESTS
// =============================================================================

export async function submitEnhancementRequest(
  userId: string,
  title: string,
  description: string,
  priority: 'low' | 'medium' | 'high'
): Promise<string | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('enhancement_requests')
    .insert({
      user_id: userId,
      title,
      description,
      priority,
      app_id: 'game-studio',
      status: 'submitted',
      votes: 1,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error submitting enhancement:', error);
    return null;
  }

  return data?.id;
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export async function sendNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<void> {
  if (!supabaseAdmin) return;

  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      data,
      read: false,
    });
}

// =============================================================================
// DISCORD WEBHOOK (for team alerts)
// =============================================================================

export async function sendDiscordAlert(embed: {
  title: string;
  description: string;
  color: number;
  fields?: { name: string; value: string; inline?: boolean }[];
}): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (error) {
    console.error('Discord webhook error:', error);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  supabase,
  supabaseAdmin,
  ECOSYSTEM_CONFIG,
  CREDIT_COSTS,
  checkCredits,
  deductCredits,
  refundCredits,
  getCreditBalance,
  getCurrentUser,
  getUserProfile,
  logActivity,
  ACTIVITY_TYPES,
  saveGame,
  getGame,
  getUserGames,
  getPublishedGames,
  recordGamePlay,
  createSupportTicket,
  submitEnhancementRequest,
  sendNotification,
  sendDiscordAlert,
};
