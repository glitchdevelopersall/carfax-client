import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// initialize Supabase using environment variables (dotenv ensures they are loaded)
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase credentials missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file')
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const createOrder = async (orderData) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return {
    success: true,
    order: data[0]
  }
}

export default supabase