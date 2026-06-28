import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Initialize user-level client to verify calling user identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid user token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Initialize admin client (service_role) to check role and manage users
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Verify caller is an admin
    const { data: profile, error: profileError } = await adminClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Access denied: Admin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action, email, password, full_name, role, userId } = await req.json()

    if (action === 'create') {
      if (!email || !password || !full_name || !role) {
        return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // 1. Create auth user with auto-confirmed email
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name }
      })

      if (authError) throw authError

      // 2. The trigger handles public.users insertion, let's update public.users with the chosen role and full_name
      const { error: updateError } = await adminClient
        .from('users')
        .update({ role, full_name })
        .eq('id', authData.user.id)

      if (updateError) throw updateError

      return new Response(JSON.stringify({ success: true, user: authData.user }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } else if (action === 'delete') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Missing userId parameter' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (userId === user.id) {
        return new Response(JSON.stringify({ error: 'Cannot delete yourself' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Delete user from auth.users (Cascade constraint deletes from public.users)
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
      if (deleteError) throw deleteError

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
