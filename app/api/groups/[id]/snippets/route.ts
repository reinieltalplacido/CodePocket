// app/api/groups/[id]/snippets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/groups/[id]/snippets
 * List all snippets shared in a group
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    
    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get group snippets with snippet details (without user joins to avoid PostgREST errors)
    const { data: groupSnippets, error } = await supabase
      .from('group_snippets')
      .select(`
        id,
        shared_at,
        shared_by,
        snippets:snippet_id(
          id,
          title,
          description,
          code,
          language,
          tags,
          created_at,
          is_favorite,
          folders(
            id,
            name,
            color
          )
        )
      `)
      .eq('group_id', id)
      .order('shared_at', { ascending: false });

    if (error) {
      console.error('Error fetching group snippets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch snippets' },
        { status: 500 }
      );
    }

    return NextResponse.json({ snippets: groupSnippets || [] });
  } catch (error) {
    console.error('Error in GET /api/groups/[id]/snippets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]/snippets
 * Share a snippet to the group
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    
    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { snippet_id } = body;

    if (!snippet_id) {
      return NextResponse.json(
        { error: 'snippet_id is required' },
        { status: 400 }
      );
    }

    // Verify user owns the snippet
    const { data: snippet, error: snippetError } = await supabase
      .from('snippets')
      .select('id, user_id')
      .eq('id', snippet_id)
      .single();

    if (snippetError || !snippet) {
      return NextResponse.json(
        { error: 'Snippet not found' },
        { status: 404 }
      );
    }

    if (snippet.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only share your own snippets' },
        { status: 403 }
      );
    }

    // Check if snippet is already shared to this group
    const { data: existing } = await supabase
      .from('group_snippets')
      .select('id')
      .eq('group_id', id)
      .eq('snippet_id', snippet_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Snippet is already shared to this group' },
        { status: 400 }
      );
    }

    // Share the snippet (RLS will check if user is a member)
    const { data: groupSnippet, error } = await supabase
      .from('group_snippets')
      .insert({
        group_id: id,
        snippet_id: snippet_id,
        shared_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error sharing snippet:', error);
      return NextResponse.json(
        { error: 'Failed to share snippet. You may not be a member of this group.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ groupSnippet }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/groups/[id]/snippets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]/snippets
 * Unshare a snippet from the group
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    
    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { snippet_id } = body;

    if (!snippet_id) {
      return NextResponse.json(
        { error: 'snippet_id is required' },
        { status: 400 }
      );
    }

    // Unshare the snippet (RLS will check permissions)
    const { error } = await supabase
      .from('group_snippets')
      .delete()
      .eq('group_id', id)
      .eq('snippet_id', snippet_id);

    if (error) {
      console.error('Error unsharing snippet:', error);
      return NextResponse.json(
        { error: 'Failed to unshare snippet' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/groups/[id]/snippets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
