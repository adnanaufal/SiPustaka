import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const payload = await req.json()
    const signatureKey = payload.signature_key
    const orderId = payload.order_id
    const statusCode = payload.status_code
    const grossAmount = payload.gross_amount
    const transactionStatus = payload.transaction_status

    // Verify signature key (Optional but recommended in production)
    // For simplicity in sandbox, we directly process based on transactionStatus

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    let paymentStatus = 'pending'
    let orderStatus = 'pending_payment'

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      paymentStatus = 'paid'
      orderStatus = 'processing'
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
      paymentStatus = 'failed'
      orderStatus = 'cancelled'
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'pending'
      orderStatus = 'pending_payment'
    }

    // Update the order in the database using order_number matching orderId
    const { data: orderData, error: findError } = await supabase
      .from('orders')
      .select('id, delivery_method')
      .eq('order_number', orderId)
      .single()

    if (findError || !orderData) {
      throw new Error(`Order not found: ${orderId}`)
    }

    // Adjust order status for store pickup if paid
    if (paymentStatus === 'paid' && orderData.delivery_method === 'pickup') {
      orderStatus = 'ready_for_pickup'
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        order_status: orderStatus,
        midtrans_transaction_id: payload.transaction_id,
        paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null,
      })
      .eq('id', orderData.id)

    if (updateError) throw updateError;

    // Deduct stock if payment completed
    if (paymentStatus === 'paid') {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('book_id, quantity')
        .eq('order_id', orderData.id)

      if (!itemsError && items) {
        for (const item of items) {
          // atomical update using rpc or update direct
          const { data: book } = await supabase
            .from('books')
            .select('stock')
            .eq('id', item.book_id)
            .single()

          if (book) {
            const newStock = Math.max(0, book.stock - item.quantity)
            await supabase
              .from('books')
              .update({ stock: newStock })
              .eq('id', item.book_id)
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
