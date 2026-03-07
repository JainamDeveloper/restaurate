import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { OPENING_HOURS } from '@/lib/opening-hours'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('restaurant_settings')
      .select('value')
      .eq('key', 'opening_hours')
      .single()

    if (error || !data) {
      return NextResponse.json({ data: OPENING_HOURS })
    }
    return NextResponse.json({ data: data.value })
  } catch {
    return NextResponse.json({ data: OPENING_HOURS })
  }
}
