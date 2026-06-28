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
    const { search } = await req.json()

    const apiKey = Deno.env.get('RAJAONGKIR_API_KEY')
    if (!apiKey) {
      throw new Error('RAJAONGKIR_API_KEY is not configured')
    }

    // Call Komerce RajaOngkir V2 Destination Search API
    const url = `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${encodeURIComponent(search || 'Jakarta')}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'key': apiKey,
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.meta?.message || 'Komerce city lookup failed')
    }

    // Map Komerce destination results to React frontend format
    const komerceData = data.data || []
    const cities = komerceData.map((item: any) => ({
      city_id: String(item.id),
      city_name: item.label || `${item.subdistrict_name}, ${item.city_name}`,
      province: item.province_name || '',
      type: '',
      postal_code: item.zip_code || '',
    }))

    return new Response(JSON.stringify({ cities }), {
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
