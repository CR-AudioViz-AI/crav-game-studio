import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET /api/credits - Get user's credit balance
export async function GET(request: NextRequest) {
  try {
    // Get user from auth header or session
    const authHeader = request.headers.get('authorization');
    const userId = request.headers.get('x-user-id'); // Set by middleware

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ balance: 0 });
    }

    return NextResponse.json({ balance: user.credits });
  } catch (error) {
    console.error('Get credits error:', error);
    return NextResponse.json({ error: 'Failed to get balance' }, { status: 500 });
  }
}

// POST /api/credits - Use credits
export async function POST(request: NextRequest) {
  try {
    const { amount, description, referenceId } = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Get current balance
    const { data: user } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    const currentCredits = user?.credits || 0;

    if (currentCredits < amount) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        balance: currentCredits,
        required: amount,
      }, { status: 400 });
    }

    // Deduct credits
    await supabase
      .from('users')
      .update({ 
        credits: currentCredits - amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // Log transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: -amount,
      type: 'usage',
      description: description || 'Credit usage',
      app_id: 'game-studio',
      reference_id: referenceId,
    });

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action: 'credits.used',
      app_id: 'game-studio',
      resource_type: 'credits',
      metadata: { amount, description, referenceId },
    });

    return NextResponse.json({ 
      success: true,
      balance: currentCredits - amount,
    });
  } catch (error) {
    console.error('Use credits error:', error);
    return NextResponse.json({ error: 'Failed to use credits' }, { status: 500 });
  }
}
