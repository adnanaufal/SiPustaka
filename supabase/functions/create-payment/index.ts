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
    const { order_id, order_number, gross_amount, customer_name, customer_email, items } = await req.json()

    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY')
    if (!serverKey) {
      throw new Error('MIDTRANS_SERVER_KEY is not configured')
    }

    // Midtrans Snap API Endpoint
    const url = 'https://app.sandbox.midtrans.com/snap/v1/transactions'
    const authHeader = btoa(`${serverKey}:`)

    const referer = req.headers.get('referer') || ''
    const originHeader = req.headers.get('origin') || ''
    
    let redirectBaseUrl = 'https://sipustaka-omega.vercel.app'
    if (referer.includes('localhost') || originHeader.includes('localhost')) {
      redirectBaseUrl = 'http://localhost:5173'
    }

    const payload = {
      transaction_details: {
        order_id: order_number,
        gross_amount: gross_amount,
      },
      customer_details: {
        first_name: customer_name,
        email: customer_email,
      },
      item_details: items.map((item: any) => ({
        id: item.id || Math.random().toString(36).substring(7),
        price: item.price,
        quantity: item.quantity,
        name: item.name.substring(0, 50),
      })),
      callbacks: {
        finish: `${redirectBaseUrl}/customer/orders`,
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authHeader}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error_messages ? data.error_messages.join(', ') : 'Midtrans error')
    }

    return new Response(JSON.stringify(data), {
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
