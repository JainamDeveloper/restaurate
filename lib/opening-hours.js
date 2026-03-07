export const OPENING_HOURS = [
  { day: 'Monday',    de: 'Montag',     open: '11:00', close: '22:00' },
  { day: 'Tuesday',   de: 'Dienstag',   open: '11:00', close: '22:00' },
  { day: 'Wednesday', de: 'Mittwoch',   open: '11:00', close: '22:00' },
  { day: 'Thursday',  de: 'Donnerstag', closed: true },
  { day: 'Friday',    de: 'Freitag',    open: '11:00', close: '23:00' },
  { day: 'Saturday',  de: 'Samstag',    open: '11:00', close: '23:00' },
  { day: 'Sunday',    de: 'Sonntag',    open: '12:00', close: '22:00' },
]

export function getTodayStatus() {
  const day  = new Date().getDay() // 0=Sun,1=Mon,...
  const map  = [6, 0, 1, 2, 3, 4, 5] // JS day → our array index
  const info = OPENING_HOURS[map[day]]
  if (info.closed) return { open: false, label: 'Closed today' }

  const now   = new Date()
  const [oh, om] = info.open.split(':').map(Number)
  const [ch, cm] = info.close.split(':').map(Number)
  const minutes  = now.getHours() * 60 + now.getMinutes()
  const isOpen   = minutes >= oh * 60 + om && minutes < ch * 60 + cm

  return {
    open:  isOpen,
    label: isOpen ? `Open · Closes ${info.close}` : `Closed · Opens ${info.open}`,
  }
}
