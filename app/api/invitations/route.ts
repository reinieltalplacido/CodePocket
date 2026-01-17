// app/api/invitations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * GET /api/invitations
 * Get all pending invitations for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Try to get user from Authorization header first
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      if (!tokenError && tokenUser) {
        user = tokenUser;
      }
    }
    
    // Fallback to cookie-based auth
    if (!user) {
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && cookieUser) {
        user = cookieUser;
      }
    }
    
    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use service role client for queries
    const { createClient } = await import('@supabase/supabase-js');
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get pending invitations for this user's email
    const { data: invitations, error } = await serviceClient
      .from('group_invitations')
      .select(`
        id,
        group_id,
        email,
        created_at,
        expires_at,
        groups:group_id (
          id,
          name,
          description
        )
      `)
      .eq('email', user.email.toLowerCase())
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ invitations: invitations || [] });
  } catch (error) {
    console.error('Error in GET /api/invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invitations
 * Accept or decline an invitation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Try to get user from Authorization header first
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      if (!tokenError && tokenUser) {
        user = tokenUser;
      }
    }
    
    // Fallback to cookie-based auth
    if (!user) {
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && cookieUser) {
        user = cookieUser;
      }
    }
    
    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { invitation_id, action } = body;

    if (!invitation_id || !action) {
      return NextResponse.json(
        { error: 'invitation_id and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'accept' && action !== 'decline') {
      return NextResponse.json(
        { error: 'action must be either "accept" or "decline"' },
        { status: 400 }
      );
    }

    // Use service role client for database operations
    const { createClient } = await import('@supabase/supabase-js');
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the invitation
    const { data: invitation, error: inviteError } = await serviceClient
      .from('group_invitations')
      .select('*')
      .eq('id', invitation_id)
      .eq('email', user.email.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (inviteError || !invitation) {
      console.error('Error fetching invitation:', inviteError);
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      await serviceClient
        .from('group_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation_id);

      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    if (action === 'accept') {
      // Add user to group
      const { error: memberError } = await serviceClient
        .from('group_members')
        .insert({
          group_id: invitation.group_id,
          user_id: user.id,
        });

      if (memberError) {
        console.error('Error adding member:', memberError);
        return NextResponse.json(
          { error: 'Failed to join group' },
          { status: 500 }
        );
      }

      // Mark invitation as accepted
      await serviceClient
        .from('group_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation_id);

      return NextResponse.json({ 
        success: true,
        message: 'Invitation accepted',
        group_id: invitation.group_id
      });
    } else {
      // Mark invitation as declined
      await serviceClient
        .from('group_invitations')
        .update({ status: 'declined' })
        .eq('id', invitation_id);

      return NextResponse.json({ 
        success: true,
        message: 'Invitation declined'
      });
    }
  } catch (error) {
    console.error('Error in POST /api/invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
