import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    const {
      email,
      password,
      nome,
      role,
      foto,
      ativo,
      endereco,
      bairro,
      cidade,
      cep,
      uf,
      cpf,
    } = await req.json()

    const { data: user, error: userError } =
      await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nome, role },
      })

    if (userError) throw userError

    if (user.user) {
      // Create profile
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          id: user.user.id,
          nome,
          email,
          role,
          foto,
          ativo: ativo !== undefined ? ativo : true,
          endereco,
          bairro,
          cidade,
          cep,
          uf,
          cpf,
        })

      if (profileError) throw profileError
    }

    return new Response(JSON.stringify(user), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
