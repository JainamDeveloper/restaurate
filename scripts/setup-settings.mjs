import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://pwsxdzetvfbdzdmtllpz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c3hkemV0dmZiZHpkbXRsbHB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg3NTE1NSwiZXhwIjoyMDg4NDUxMTU1fQ.tPzp-B3c_ywAl--jPrezvCAzYRDKGtXhDty9UHOAV4E'
)

const defaultHours = [
  { day: 'Monday',    de: 'Montag',     open: '11:00', close: '22:00', closed: false },
  { day: 'Tuesday',   de: 'Dienstag',   open: '11:00', close: '22:00', closed: false },
  { day: 'Wednesday', de: 'Mittwoch',   open: '11:00', close: '22:00', closed: false },
  { day: 'Thursday',  de: 'Donnerstag', open: '11:00', close: '22:00', closed: true  },
  { day: 'Friday',    de: 'Freitag',    open: '11:00', close: '23:00', closed: false },
  { day: 'Saturday',  de: 'Samstag',    open: '11:00', close: '23:00', closed: false },
  { day: 'Sunday',    de: 'Sonntag',    open: '12:00', close: '22:00', closed: false },
]

// Try insert — will fail if table doesn't exist (need to create via SQL editor)
const { error } = await supabase
  .from('restaurant_settings')
  .upsert({ key: 'opening_hours', value: defaultHours }, { onConflict: 'key' })

if (error) {
  console.error('❌ Error:', error.message)
  console.log('\nPlease run this SQL in Supabase SQL Editor first:\n')
  console.log(`create table if not exists restaurant_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz default now()
);`)
} else {
  console.log('✅ Opening hours saved to restaurant_settings')
}
