import supabase from './supabase.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const adminLogin = async (username, password) => {
  if (!supabase) {
    throw new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file')
  }

  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !admin) {
    throw new Error("Invalid credentials")
  }

  // If the stored password doesn't look like a bcrypt hash, assume it's plain text
  // This can happen if the admin was created manually without hashing. We'll
  // validate by simple equality and then upgrade the stored password to a hash
  // for future security.
  let valid = false
  const isHash = typeof admin.password === 'string' && admin.password.startsWith('$2')
  if (isHash) {
    valid = await bcrypt.compare(password, admin.password)
  } else {
    // plain-text in DB; compare directly and upgrade
    valid = password === admin.password
    if (valid) {
      const newHash = await bcrypt.hash(password, 10)
      await supabase
        .from('admins')
        .update({ password: newHash })
        .eq('id', admin.id)
      // replace local variable so later logic still works if needed
      admin.password = newHash
    }
  }

  if (!valid) {
    throw new Error("Invalid credentials")
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured in .env file')
  }

  const token = jwt.sign(
    { id: admin.id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  )

  return {
    success: true,
    token
  }
}
