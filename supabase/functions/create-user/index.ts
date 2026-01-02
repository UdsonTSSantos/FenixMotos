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

    const payload = await req.json()
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
    } = payload

    // Validate required fields
    if (!email || !password || !nome || !role) {
      return new Response(
        JSON.stringify({
          error: 'Campos obrigatórios: Nome, Email, Senha e Cargo.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Returning 200 to allow client to handle error message gracefully
        },
      )
    }

    // Create Auth User
    const { data: user, error: userError } =
      await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nome, role },
      })

    if (userError) {
      return new Response(JSON.stringify({ error: userError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (user.user) {
      // Create profile in public schema
      // We explicitly handle optional/missing fields by defaulting to null where appropriate
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          id: user.user.id,
          nome,
          email,
          role,
          foto: foto || null, // Handle missing photo
          ativo: ativo !== undefined ? ativo : true,
          endereco: endereco || null,
          bairro: bairro || null,
          cidade: cidade || null,
          cep: cep || null,
          uf: uf || null,
          cpf: cpf || null,
        })

      if (profileError) {
        // Rollback: delete the auth user if profile creation fails to ensure consistency
        await supabaseClient.auth.admin.deleteUser(user.user.id)

        return new Response(
          JSON.stringify({
            error:
              'Erro ao criar perfil de colaborador: ' + profileError.message,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      }
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
