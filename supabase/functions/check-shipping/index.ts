import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { origin, destination, weight, courier } = await req.json()

    const apiKey = Deno.env.get('RAJAONGKIR_API_KEY')
    if (!apiKey) {
      throw new Error('RAJAONGKIR_API_KEY is not configured')
    }

    // Call Komerce RajaOngkir V2 Calculate Domestic Cost API
    const response = await fetch('https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost', {
      method: 'POST',
      headers: {
        'key': apiKey,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        origin: String(origin),
        destination: String(destination),
        weight: String(weight),
        courier: String(courier).toLowerCase(), // 'jne', 'tiki', or 'pos'
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.meta?.message || 'Komerce cost calculation failed')
    }

    const komerceData = data.data || []
    const results = komerceData.map((item: any) => ({
      service: item.service,
      description: item.description,
      cost: [
        {
          value: Number(item.cost || 0),
          etd: String(item.etd || '').replace(/[^0-9-]/g, ''),
        }
      ]
    }))

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
