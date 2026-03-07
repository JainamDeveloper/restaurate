import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://pwsxdzetvfbdzdmtllpz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c3hkemV0dmZiZHpkbXRsbHB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg3NTE1NSwiZXhwIjoyMDg4NDUxMTU1fQ.tPzp-B3c_ywAl--jPrezvCAzYRDKGtXhDty9UHOAV4E'
)

// Fetch all items ordered by sort_order to know the sequence
const { data: items } = await supabase
  .from('menu_items')
  .select('id, name')
  .order('id')

console.log('Menu items:', items.map(i => `${i.id}: ${i.name}`).join('\n'))

// Assign images by name
const imageMap = {
  'Wiener Schnitzel':  'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400',
  'Jägerschnitzel':    'https://images.unsplash.com/photo-1619895092538-128341789043?w=400',
  'Rindergulasch':     'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
  'Pizza Margherita':  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
  'Pizza Salami':      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
  'Weißbier':          'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
  'Apfelstrudel':      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
}

for (const item of items) {
  const url = imageMap[item.name]
  if (!url) { console.log(`⏭  No image for: ${item.name}`); continue }

  const { error } = await supabase
    .from('menu_items')
    .update({ image_url: url })
    .eq('id', item.id)

  if (error) console.error(`❌ ${item.name}:`, error.message)
  else       console.log(`✅ ${item.name}`)
}

console.log('\nDone!')
