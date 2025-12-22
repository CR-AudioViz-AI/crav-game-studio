import { NextRequest, NextResponse } from 'next/server';

// Game template definitions for AI to use
const GAME_TEMPLATES = {
  platformer: {
    name: 'Platformer',
    baseFeatures: ['jump mechanics', 'coin collection', 'enemy AI', 'lives system'],
    customizable: ['player color', 'enemy types', 'level count', 'power-ups', 'theme'],
  },
  match3: {
    name: 'Match-3 Puzzle',
    baseFeatures: ['swap mechanics', 'combo system', 'score tracking', 'level progression'],
    customizable: ['gem colors', 'grid size', 'special tiles', 'theme'],
  },
  shooter: {
    name: 'Space Shooter',
    baseFeatures: ['shooting mechanics', 'enemy waves', 'power-ups', 'boss battles'],
    customizable: ['ship design', 'weapon types', 'enemy types', 'background theme'],
  },
  racing: {
    name: 'Racing',
    baseFeatures: ['lane switching', 'obstacles', 'speed boost', 'coin collection'],
    customizable: ['vehicle type', 'track theme', 'power-ups', 'difficulty'],
  },
  runner: {
    name: 'Endless Runner',
    baseFeatures: ['auto-run', 'jump/duck', 'collectibles', 'high score'],
    customizable: ['character', 'obstacles', 'environment', 'power-ups'],
  },
  quiz: {
    name: 'Quiz/Trivia',
    baseFeatures: ['multiple choice', 'timer', 'categories', 'streak system'],
    customizable: ['questions', 'categories', 'difficulty', 'theme'],
  },
  rpg: {
    name: 'RPG',
    baseFeatures: ['turn-based combat', 'skills', 'leveling', 'enemy progression'],
    customizable: ['character class', 'skills', 'enemies', 'story'],
  },
  'tower-defense': {
    name: 'Tower Defense',
    baseFeatures: ['tower placement', 'waves', 'upgrades', 'path system'],
    customizable: ['tower types', 'enemy types', 'map layout', 'theme'],
  },
  idle: {
    name: 'Idle/Clicker',
    baseFeatures: ['clicking', 'upgrades', 'automation', 'achievements'],
    customizable: ['theme', 'upgrade names', 'achievement types', 'prestige system'],
  },
  'card-game': {
    name: 'Card Game',
    baseFeatures: ['deck building', 'turn-based', 'card effects', 'enemy progression'],
    customizable: ['card types', 'themes', 'special effects', 'enemy types'],
  },
};

// Parse user intent from their message
function parseGameIntent(message: string): {
  suggestedTemplate: string | null;
  features: string[];
  theme: string | null;
  customizations: Record<string, string>;
} {
  const lowerMessage = message.toLowerCase();
  
  let suggestedTemplate: string | null = null;
  const features: string[] = [];
  let theme: string | null = null;
  const customizations: Record<string, string> = {};

  // Detect game type
  if (lowerMessage.includes('platformer') || lowerMessage.includes('jump') || lowerMessage.includes('mario')) {
    suggestedTemplate = 'platformer';
  } else if (lowerMessage.includes('match') || lowerMessage.includes('puzzle') || lowerMessage.includes('candy')) {
    suggestedTemplate = 'match3';
  } else if (lowerMessage.includes('shoot') || lowerMessage.includes('space') || lowerMessage.includes('alien')) {
    suggestedTemplate = 'shooter';
  } else if (lowerMessage.includes('race') || lowerMessage.includes('car') || lowerMessage.includes('drive')) {
    suggestedTemplate = 'racing';
  } else if (lowerMessage.includes('run') || lowerMessage.includes('endless') || lowerMessage.includes('runner')) {
    suggestedTemplate = 'runner';
  } else if (lowerMessage.includes('quiz') || lowerMessage.includes('trivia') || lowerMessage.includes('question')) {
    suggestedTemplate = 'quiz';
  } else if (lowerMessage.includes('rpg') || lowerMessage.includes('battle') || lowerMessage.includes('combat') || lowerMessage.includes('turn')) {
    suggestedTemplate = 'rpg';
  } else if (lowerMessage.includes('tower') || lowerMessage.includes('defend') || lowerMessage.includes('wave')) {
    suggestedTemplate = 'tower-defense';
  } else if (lowerMessage.includes('idle') || lowerMessage.includes('click') || lowerMessage.includes('cookie')) {
    suggestedTemplate = 'idle';
  } else if (lowerMessage.includes('card') || lowerMessage.includes('deck') || lowerMessage.includes('slay')) {
    suggestedTemplate = 'card-game';
  }

  // Detect theme
  const themes = ['space', 'fantasy', 'medieval', 'sci-fi', 'underwater', 'jungle', 'desert', 'ice', 'fire', 'neon', 'retro', 'pixel'];
  for (const t of themes) {
    if (lowerMessage.includes(t)) {
      theme = t;
      break;
    }
  }

  // Detect features
  if (lowerMessage.includes('power-up') || lowerMessage.includes('powerup')) features.push('power-ups');
  if (lowerMessage.includes('boss')) features.push('boss battles');
  if (lowerMessage.includes('level')) features.push('multiple levels');
  if (lowerMessage.includes('multiplayer')) features.push('multiplayer');
  if (lowerMessage.includes('achievement')) features.push('achievements');
  if (lowerMessage.includes('leaderboard')) features.push('leaderboards');
  if (lowerMessage.includes('story')) features.push('story mode');
  if (lowerMessage.includes('upgrade')) features.push('upgrade system');

  // Detect difficulty
  if (lowerMessage.includes('easy') || lowerMessage.includes('casual')) {
    customizations.difficulty = 'easy';
  } else if (lowerMessage.includes('hard') || lowerMessage.includes('difficult') || lowerMessage.includes('challenge')) {
    customizations.difficulty = 'hard';
  }

  // Detect art style
  if (lowerMessage.includes('pixel')) customizations.artStyle = 'pixel';
  if (lowerMessage.includes('cartoon')) customizations.artStyle = 'cartoon';
  if (lowerMessage.includes('realistic')) customizations.artStyle = 'realistic';
  if (lowerMessage.includes('minimalist')) customizations.artStyle = 'minimalist';

  return { suggestedTemplate, features, theme, customizations };
}

// Generate conversation response
function generateResponse(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
  templateParam: string | null
): {
  response: string;
  gameReady: boolean;
  templateId: string | null;
  customizations: Record<string, string>;
  stage: 'initial' | 'gathering' | 'confirming' | 'generating' | 'complete';
} {
  const intent = parseGameIntent(message);
  const messageCount = conversationHistory.length;
  
  // If coming from a template
  if (templateParam && messageCount <= 2) {
    const template = GAME_TEMPLATES[templateParam as keyof typeof GAME_TEMPLATES];
    if (template) {
      return {
        response: `I see you want to customize the **${template.name}** template! 🎮

This template includes:
${template.baseFeatures.map(f => `• ${f}`).join('\n')}

What customizations would you like to make?

You can change:
${template.customizable.map(c => `• **${c}**`).join('\n')}

Just tell me what you'd like, for example:
- "Make it space-themed with aliens"
- "Add power-ups and boss battles"
- "Change the colors to blue and gold"`,
        gameReady: false,
        templateId: templateParam,
        customizations: {},
        stage: 'gathering',
      };
    }
  }

  // Stage 1: Initial - understand what they want
  if (messageCount <= 2 || !intent.suggestedTemplate) {
    if (intent.suggestedTemplate) {
      const template = GAME_TEMPLATES[intent.suggestedTemplate as keyof typeof GAME_TEMPLATES];
      return {
        response: `Great choice! 🎮 I'll create a **${template?.name || intent.suggestedTemplate}** game for you!

Based on what you described, here's my plan:
${intent.theme ? `• **Theme:** ${intent.theme}` : ''}
${intent.features.length > 0 ? `• **Features:** ${intent.features.join(', ')}` : ''}
${intent.customizations.artStyle ? `• **Art Style:** ${intent.customizations.artStyle}` : ''}
${intent.customizations.difficulty ? `• **Difficulty:** ${intent.customizations.difficulty}` : ''}

Before I start building, would you like to:
1. **Add more features?** (power-ups, story mode, achievements)
2. **Change the style?** (pixel art, cartoon, realistic)
3. **Start building now?** (Just say "build it!")

What would you like to do?`,
        gameReady: false,
        templateId: intent.suggestedTemplate,
        customizations: intent.customizations,
        stage: 'gathering',
      };
    } else {
      return {
        response: `I'd love to help you create a game! 🎮

Could you tell me more about what kind of game you're imagining? Here are some options:

🎮 **Platformer** - Jump, collect, and explore
💎 **Puzzle** - Match gems, solve challenges
🚀 **Shooter** - Blast enemies in space
🏎️ **Racing** - Speed through tracks
🏃 **Endless Runner** - Run as far as you can
🧠 **Quiz** - Test your knowledge
⚔️ **RPG** - Battle, level up, adventure
🏰 **Tower Defense** - Place towers, stop waves
🍪 **Idle** - Click and upgrade
🃏 **Card Game** - Build decks, battle enemies

Just describe what you want, like:
- "A space shooter with boss battles"
- "A platformer where a cat collects fish"
- "A quiz game about science"`,
        gameReady: false,
        templateId: null,
        customizations: {},
        stage: 'initial',
      };
    }
  }

  // Stage 2: Gathering - they've described features
  if (messageCount <= 4) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('build') || lowerMessage.includes('start') || lowerMessage.includes('create') || lowerMessage.includes('ready') || lowerMessage.includes('go')) {
      return {
        response: `🚀 **Building your game now!**

I'm generating:
✅ Game engine and mechanics
✅ Visual assets and sprites
✅ Sound effects
✅ UI and menus
⏳ Putting it all together...

This takes about 10-15 seconds. Get ready to play!`,
        gameReady: true,
        templateId: intent.suggestedTemplate || templateParam,
        customizations: intent.customizations,
        stage: 'generating',
      };
    }

    return {
      response: `Got it! I'll add that to your game. 📝

Updated plan:
${intent.features.length > 0 ? `• **New features:** ${intent.features.join(', ')}` : '• Keeping the base features'}
${intent.theme ? `• **Theme:** ${intent.theme}` : ''}
${intent.customizations.artStyle ? `• **Art:** ${intent.customizations.artStyle}` : ''}

Anything else you'd like to add, or should I **start building**?`,
      gameReady: false,
      templateId: intent.suggestedTemplate || templateParam,
      customizations: { ...intent.customizations },
      stage: 'confirming',
    };
  }

  // Stage 3: Ready to generate
  return {
    response: `🚀 **Building your game now!**

Creating:
✅ Game mechanics
✅ Visual assets
✅ Sound effects
✅ UI elements
⏳ Finalizing...

Your game will be ready in seconds!`,
    gameReady: true,
    templateId: intent.suggestedTemplate || templateParam,
    customizations: intent.customizations,
    stage: 'generating',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [], templateId = null } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const result = generateResponse(message, conversationHistory, templateId);

    return NextResponse.json({
      response: result.response,
      gameReady: result.gameReady,
      templateId: result.templateId,
      customizations: result.customizations,
      stage: result.stage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
