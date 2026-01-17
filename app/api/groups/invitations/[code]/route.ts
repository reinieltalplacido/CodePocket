// app/api/groups/invitations/[code]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

type RouteContext = {
  params: Promise<{ code: string }>;
};

/**
 * GET /api/groups/invitations/[code]
 * Get invitation details by invite code
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { code } = await context.params;
    const supabase = await createServerSupabaseClient();

    // Get invitation details
    const { data: invitation, error } = await supabase
      .from('group_invitations')
      .select(`
        id,
        email,
        status,
        created_at,
        expires_at,
        groups:group_id(
          id,
          name,
          description
        ),
        inviter:inviter_id(
          id,
          email,
          raw_user_meta_data
        )
      `)
      .eq('invite_code', code)
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    const isExpired = new Date(invitation.expires_at) < new Date();
    
    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `Invitation has been ${invitation.status}` },
        { status: 400 }
      );
    }

    if (isExpired) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error('Error in GET /api/groups/invitations/[code]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/invitations/[code]
 * Accept an invitation
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { code } = await context.params;
    const supabase = await createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to accept an invitation' },
        { status: 401 }
      );
    }

    // Get invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('group_invitations')
      .select('*')
      .eq('invite_code', code)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Validate invitation
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `Invitation has been ${invitation.status}` },
        { status: 400 }
      );
    }

    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Check if user's email matches invitation email
    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', invitation.group_id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this group' },
        { status: 400 }
      );
    }

    // Add user to group
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: invitation.group_id,
        user_id: user.id
      });

    if (memberError) {
      console.error('Error adding member:', memberError);
      return NextResponse.json(
        { error: 'Failed to join group' },
        { status: 500 }
      );
    }

    // Update invitation status
    await supabase
      .from('group_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);

    return NextResponse.json({ 
      success: true,
      group_id: invitation.group_id
    });
  } catch (error) {
    console.error('Error in POST /api/groups/invitations/[code]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/invitations/[code]
 * Decline an invitation
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { code } = await context.params;
    const supabase = await createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update invitation status (RLS will check permissions)
    const { error } = await supabase
      .from('group_invitations')
      .update({ status: 'declined' })
      .eq('invite_code', code);

    if (error) {
      console.error('Error declining invitation:', error);
      return NextResponse.json(
        { error: 'Failed to decline invitation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/groups/invitations/[code]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
