import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getCuratedById } from '@/lib/kv'
import { getBusinessById } from '@/lib/yelp'
import type { Business } from '@/lib/yelp'

export const dynamic = 'force-dynamic'

interface Theme {
  gradient: string
  accent: string
  accentHover: string
  accentText: string
  label: string
  tagline: string
  icon: string
}

const THEMES: Record<string, Theme> = {
  plumbing: {
    gradient: 'from-blue-950 via-blue-900 to-blue-800',
    accent: 'bg-blue-500 hover:bg-blue-400',
    accentHover: 'hover:bg-blue-400',
    accentText: 'text-white',
    label: 'Plumbing Services',
    tagline: 'Professional plumbing you can count on',
    icon: '🔧',
  },
  electricians: {
    gradient: 'from-amber-950 via-yellow-900 to-amber-800',
    accent: 'bg-amber-400 hover:bg-amber-300',
    accentHover: 'hover:bg-amber-300',
    accentText: 'text-amber-950',
    label: 'Electrical Services',
    tagline: 'Licensed electricians for every job',
    icon: '⚡',
  },
  airconditioningheating: {
    gradient: 'from-cyan-950 via-sky-900 to-cyan-800',
    accent: 'bg-cyan-400 hover:bg-cyan-300',
    accentHover: 'hover:bg-cyan-300',
    accentText: 'text-cyan-950',
    label: 'HVAC Services',
    tagline: 'Comfort all year round',
    icon: '❄️',
  },
  roofing: {
    gradient: 'from-stone-950 via-stone-900 to-slate-800',
    accent: 'bg-stone-400 hover:bg-stone-300',
    accentHover: 'hover:bg-stone-300',
    accentText: 'text-stone-950',
    label: 'Roofing Services',
    tagline: 'Built to last, roof to foundation',
    icon: '🏠',
  },
  paintingcontractors: {
    gradient: 'from-purple-950 via-violet-900 to-purple-800',
    accent: 'bg-violet-500 hover:bg-violet-400',
    accentHover: 'hover:bg-violet-400',
    accentText: 'text-white',
    label: 'Painting Services',
    tagline: 'Fresh look, lasting finish',
    icon: '🖌️',
  },
  landscaping: {
    gradient: 'from-green-950 via-emerald-900 to-green-800',
    accent: 'bg-emerald-500 hover:bg-emerald-400',
    accentHover: 'hover:bg-emerald-400',
    accentText: 'text-white',
    label: 'Landscaping Services',
    tagline: 'Beautiful outdoor spaces',
    icon: '🌿',
  },
  pestcontrol: {
    gradient: 'from-orange-950 via-amber-900 to-orange-800',
    accent: 'bg-orange-500 hover:bg-orange-400',
    accentHover: 'hover:bg-orange-400',
    accentText: 'text-white',
    label: 'Pest Control Services',
    tagline: 'Your home, pest-free',
    icon: '🐛',
  },
  homecleaning: {
    gradient: 'from-sky-900 via-blue-800 to-sky-700',
    accent: 'bg-sky-400 hover:bg-sky-300',
    accentHover: 'hover:bg-sky-300',
    accentText: 'text-sky-950',
    label: 'Home Cleaning Services',
    tagline: 'Spotless, every time',
    icon: '🧹',
  },
  generalcontractors: {
    gradient: 'from-slate-950 via-gray-900 to-slate-800',
    accent: 'bg-slate-400 hover:bg-slate-300',
    accentHover: 'hover:bg-slate-300',
    accentText: 'text-slate-950',
    label: 'General Contracting',
    tagline: 'Quality work, guaranteed',
    icon: '🏗️',
  },
  locksmiths: {
    gradient: 'from-zinc-950 via-neutral-900 to-zinc-800',
    accent: 'bg-yellow-400 hover:bg-yellow-300',
    accentHover: 'hover:bg-yellow-300',
    accentText: 'text-zinc-950',
    label: 'Locksmith Services',
    tagline: 'Trusted security solutions',
    icon: '🔑',
  },
}

const DEFAULT_THEME: Theme = {
  gradient: 'from-slate-950 via-slate-900 to-slate-800',
  accent: 'bg-slate-500 hover:bg-slate-400',
  accentHover: 'hover:bg-slate-400',
  accentText: 'text-white',
  label: 'Home Services',
  tagline: 'Serving your home with pride',
  icon: '🏠',
}

const CATEGORY_HIGHLIGHTS: Record<string, string[]> = {
  plumbing: ['24/7 emergency leak response', 'Upfront pricing — no surprise fees', 'Drain, water heater & repipe specialists'],
  electricians: ['Licensed master electricians', 'Panel upgrades & EV charger installs', 'Code-compliant work, fully permitted'],
  airconditioningheating: ['Same-day AC & furnace repair', 'Energy-efficient system installs', 'Seasonal tune-ups & maintenance plans'],
  roofing: ['Free inspections & estimates', 'Insurance claim assistance', 'Workmanship & material warranties'],
  paintingcontractors: ['Interior & exterior specialists', 'Premium low-VOC paints', 'Color consultation included'],
  landscaping: ['Full-service design & maintenance', 'Drought-tolerant plant experts', 'Year-round seasonal care'],
  pestcontrol: ['Pet- and family-safe treatments', 'Targeted, long-lasting solutions', 'Free re-treatments if pests return'],
  homecleaning: ['Vetted, insured cleaning teams', 'Eco-friendly products available', 'Flexible weekly or one-time service'],
  generalcontractors: ['Full-service remodel & build-outs', 'Licensed, bonded & insured', 'Transparent project timelines'],
  locksmiths: ['Fast 24/7 lockout response', 'Residential, auto & commercial', 'Modern smart-lock installs'],
}

const DEFAULT_HIGHLIGHTS = ['Background-checked technicians', 'Upfront, honest pricing', 'Fully licensed & insured']

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  Plumbing: 'Repairs, installs, and emergency service for the whole home.',
  Electricians: 'Wiring, panels, lighting, and modern electrical upgrades.',
  'Heating & Air Conditioning/HVAC': 'Climate control systems installed and maintained year-round.',
  Roofing: 'Repairs, replacements, and inspections that stand up to weather.',
  'Painters': 'Interior and exterior painting with a clean, lasting finish.',
  'Painting Contractors': 'Interior and exterior painting with a clean, lasting finish.',
  Landscaping: 'Design, maintenance, and care for your outdoor spaces.',
  'Pest Control': 'Targeted treatments to protect your home and family.',
  'Home Cleaning': 'Reliable, thorough cleaning on your schedule.',
  'House Cleaning': 'Reliable, thorough cleaning on your schedule.',
  'General Contractors': 'Remodels, additions, and full-scope building projects.',
  Locksmiths: 'Fast lockout help, rekeys, and modern lock installs.',
  'Water Heater Installation/Repair': 'Tankless and traditional water heater experts.',
  'Drain Cleaning': 'Clears stubborn clogs and restores full flow.',
  'Heating': 'Furnace, heat pump, and boiler service.',
  'Air Duct Cleaning': 'Cleaner air and more efficient HVAC performance.',
}

const CATEGORY_FAQS: Record<string, { q: string; a: string }[]> = {
  plumbing: [
    { q: 'Do you offer free estimates?', a: 'Yes — we provide free, no-obligation estimates for most plumbing projects. Emergency calls may carry a diagnostic fee.' },
    { q: 'Are you licensed and insured?', a: 'Absolutely. We carry full state plumbing licensing, liability insurance, and bonding for every job we do.' },
    { q: 'Do you handle emergencies after hours?', a: 'Yes. Burst pipes and major leaks don’t wait, so we respond around the clock.' },
    { q: 'How quickly can you come out?', a: 'Most non-emergency calls are scheduled within 24 hours; emergencies are typically dispatched the same day.' },
  ],
  electricians: [
    { q: 'Are your electricians licensed?', a: 'Every electrician on our team is fully licensed, and all work is performed to current code with proper permits.' },
    { q: 'Can you install EV chargers?', a: 'Yes — we install Level 2 home EV chargers and can upgrade your panel if needed.' },
    { q: 'Do you offer free estimates?', a: 'We offer free estimates for most installation projects. Diagnostic calls have a flat service fee.' },
    { q: 'How soon can you respond to an outage?', a: 'For partial or full outages, we prioritize same-day service whenever possible.' },
  ],
  airconditioningheating: [
    { q: 'Do you service all HVAC brands?', a: 'Yes — our technicians are trained on every major brand of furnace, AC, and heat pump.' },
    { q: 'Do you offer maintenance plans?', a: 'We offer seasonal tune-up plans that keep your system efficient and extend its lifespan.' },
    { q: 'Can you replace an entire system?', a: 'Absolutely. We size, quote, and install full HVAC replacements with manufacturer-backed warranties.' },
    { q: 'How fast can you come out for no AC?', a: 'During peak season we prioritize no-cool calls and aim for same-day arrival.' },
  ],
  roofing: [
    { q: 'Do you offer free inspections?', a: 'Yes — every estimate includes a thorough roof inspection at no cost.' },
    { q: 'Can you help with insurance claims?', a: 'We work directly with most major insurers to document storm and hail damage.' },
    { q: 'What warranties do you provide?', a: 'We back our workmanship and pass through full manufacturer warranties on materials.' },
    { q: 'How long does a roof replacement take?', a: 'Most residential roof replacements are completed in 1–2 days, weather permitting.' },
  ],
  paintingcontractors: [
    { q: 'Do you offer color consultations?', a: 'Yes, color consultation is included with every project to help you choose the right palette.' },
    { q: 'What kind of paint do you use?', a: 'We use premium, low-VOC paints from trusted brands and can match any finish or sheen.' },
    { q: 'Do you handle prep work?', a: 'Sanding, patching, caulking, and priming are all part of every job — proper prep is what makes paint last.' },
    { q: 'How long will the paint last?', a: 'Interior jobs typically last 7–10 years and exteriors 5–8 years, backed by our workmanship guarantee.' },
  ],
  landscaping: [
    { q: 'Do you offer one-time and recurring service?', a: 'Both — from one-off cleanups to full weekly maintenance and seasonal care.' },
    { q: 'Can you design a new yard from scratch?', a: 'Yes. Our designers create plans tailored to your space, sun exposure, and water needs.' },
    { q: 'Are you familiar with drought-tolerant planting?', a: 'Absolutely. We specialize in beautiful, low-water landscapes suited to local conditions.' },
    { q: 'Do you handle irrigation?', a: 'We design, install, and repair efficient irrigation and drip systems.' },
  ],
  pestcontrol: [
    { q: 'Are your treatments safe for pets?', a: 'Yes — all of our standard treatments are safe for kids and pets once dry.' },
    { q: 'How long do treatments last?', a: 'Most exterior treatments last 60–90 days. We also offer recurring plans for year-round protection.' },
    { q: 'What if pests come back?', a: 'We re-treat between scheduled visits at no extra cost if pests return.' },
    { q: 'Do you handle termites and rodents?', a: 'Yes — our technicians are trained for termites, rodents, and all common household pests.' },
  ],
  homecleaning: [
    { q: 'Do I need to be home during cleaning?', a: 'No — most clients give us secure entry instructions. Whatever works best for you.' },
    { q: 'Are your cleaners insured?', a: 'Every cleaner is background-checked, trained, and fully insured.' },
    { q: 'Do you bring supplies?', a: 'Yes, we bring all standard cleaning supplies and equipment. Eco-friendly options available on request.' },
    { q: 'Can I customize what gets cleaned?', a: 'Absolutely — every plan is tailored to your priorities and home layout.' },
  ],
  generalcontractors: [
    { q: 'Do you handle permits?', a: 'Yes — we pull all required permits and coordinate inspections as part of every project.' },
    { q: 'Can you provide references?', a: 'Happily. We can share recent project photos and connect you with past clients.' },
    { q: 'How do you price projects?', a: 'We provide detailed, line-item estimates with transparent pricing on labor and materials.' },
    { q: 'How long will my project take?', a: 'Timelines depend on scope — we provide a written schedule with milestones at the start of every job.' },
  ],
  locksmiths: [
    { q: 'How fast is your response time?', a: 'For lockouts we typically arrive within 30 minutes, 24/7.' },
    { q: 'Can you make car keys?', a: 'Yes — including modern transponder keys and key fob programming for most makes and models.' },
    { q: 'Do you install smart locks?', a: 'We install and configure all major smart-lock brands and connect them to your home network.' },
    { q: 'Are you licensed and bonded?', a: 'Yes, we’re fully licensed, bonded, and insured for residential, auto, and commercial work.' },
  ],
}

const DEFAULT_FAQS = [
  { q: 'Do you offer free estimates?', a: 'Yes — we provide free, no-obligation estimates for most projects.' },
  { q: 'Are you licensed and insured?', a: 'We are fully licensed, insured, and bonded for the work we perform.' },
  { q: 'How quickly can you come out?', a: 'Most non-emergency calls are scheduled within 24–48 hours.' },
  { q: 'What areas do you serve?', a: 'We serve homeowners throughout the greater service area listed on this page.' },
]

function deriveCity(address?: string): string | null {
  if (!address) return null
  const parts = address.split(',').map((s) => s.trim()).filter(Boolean)
  return parts.length >= 2 ? parts[parts.length - 2] : null
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[0, 1, 2, 3, 4].map((i) => {
          const fillPct = Math.max(0, Math.min(1, rating - i)) * 100
          return (
            <span key={i} className="relative inline-block h-5 w-5">
              <svg viewBox="0 0 24 24" className="absolute inset-0 h-5 w-5 text-white/20" fill="currentColor">
                <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.6l-5.9 3.08 1.13-6.58L2.45 9.44l6.6-.96L12 2.5z" />
              </svg>
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPct}%` }}>
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-400" fill="currentColor">
                  <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.6l-5.9 3.08 1.13-6.58L2.45 9.44l6.6-.96L12 2.5z" />
                </svg>
              </span>
            </span>
          )
        })}
      </div>
      <span className="text-white/90 font-semibold">{rating.toFixed(1)}</span>
      <span className="text-white/50 text-sm">({count.toLocaleString()} reviews)</span>
    </div>
  )
}

export default async function ProSitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let business: Business | null = await getCuratedById(id)
  if (!business) {
    business = await getBusinessById(id).catch(() => null)
  }
  if (!business || !business.proSiteEnabled) notFound()

  const theme = THEMES[business.category ?? ''] ?? DEFAULT_THEME
  const mapsUrl = business.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`
    : null
  const highlights = CATEGORY_HIGHLIGHTS[business.category ?? ''] ?? DEFAULT_HIGHLIGHTS
  const faqs = CATEGORY_FAQS[business.category ?? ''] ?? DEFAULT_FAQS
  const serviceAreaCities = (business.cities && business.cities.length > 0)
    ? business.cities
    : ([deriveCity(business.address)].filter(Boolean) as string[])

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero */}
      <section className={`relative min-h-[72vh] flex flex-col bg-gradient-to-br ${theme.gradient}`}>
        {/* Background photo */}
        {business.imageUrl && (
          <div className="absolute inset-0">
            <Image
              src={business.imageUrl}
              alt=""
              fill
              className="object-cover opacity-20"
              sizes="100vw"
              priority
            />
          </div>
        )}

        {/* Nav bar */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            HomeHelp
          </Link>
          <span className="text-white/40 text-xs tracking-widest uppercase">ProSite</span>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-16 pt-8">
          {/* Avatar */}
          {business.imageUrl ? (
            <div className="relative h-28 w-28 rounded-full ring-4 ring-white/20 shadow-2xl overflow-hidden mb-6">
              <Image
                src={business.imageUrl}
                alt={business.name}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
          ) : (
            <div className="h-28 w-28 rounded-full ring-4 ring-white/20 shadow-2xl bg-white/10 flex items-center justify-center mb-6 text-5xl">
              {theme.icon}
            </div>
          )}

          {/* Category pill */}
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-white/60 mb-3">
            {theme.label}
          </span>

          {/* Business name */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-3 max-w-2xl">
            {business.name}
          </h1>

          {/* Tagline */}
          <p className="text-white/60 text-lg mb-6 max-w-md">{theme.tagline}</p>

          {/* Rating or verified badge */}
          {business.rating != null && business.reviewCount != null ? (
            <div className="mb-8">
              <StarRating rating={business.rating} count={business.reviewCount} />
            </div>
          ) : (
            <div className="mb-8">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 bg-emerald-950/50 ring-1 ring-emerald-500/30 px-3 py-1.5 rounded-full">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                  <path d="M12 2 4 6v6c0 5 3.4 9.3 8 10 4.6-.7 8-5 8-10V6l-8-4Zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 5.5-5.5 1.4 1.4-6.9 6.9Z" />
                </svg>
                Verified Pro
              </span>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-lg ${theme.accent} ${theme.accentText}`}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
                </svg>
                Call Now
              </a>
            )}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/20 transition-all"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Get Directions
              </a>
            )}
            {business.websiteUrl && (
              <a
                href={business.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/20 transition-all"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Visit Website
              </a>
            )}
          </div>
        </div>

        {/* Bottom wave */}
        <div className="relative z-10">
          <svg viewBox="0 0 1440 60" className="w-full fill-white" preserveAspectRatio="none" style={{ display: 'block', height: 48 }}>
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* Stats / Trust Strip */}
      <section className="bg-white px-6 -mt-6 relative z-20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-white rounded-3xl ring-1 ring-slate-200 shadow-xl p-4 sm:p-6">
          {business.rating != null && (
            <div className="flex flex-col items-center text-center px-2 py-3">
              <div className="text-3xl font-extrabold text-slate-900 leading-none mb-1">{business.rating.toFixed(1)}</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Average Rating</div>
            </div>
          )}
          {business.reviewCount != null && (
            <div className="flex flex-col items-center text-center px-2 py-3">
              <div className="text-3xl font-extrabold text-slate-900 leading-none mb-1">{business.reviewCount.toLocaleString()}</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Happy Customers</div>
            </div>
          )}
          <div className="flex flex-col items-center text-center px-2 py-3">
            <div className="h-10 w-10 rounded-full bg-emerald-50 ring-1 ring-emerald-200 flex items-center justify-center mb-1">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600" fill="currentColor">
                <path d="M12 2 4 6v6c0 5 3.4 9.3 8 10 4.6-.7 8-5 8-10V6l-8-4Zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 5.5-5.5 1.4 1.4-6.9 6.9Z" />
              </svg>
            </div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Licensed &amp; Verified</div>
          </div>
          <div className="flex flex-col items-center text-center px-2 py-3">
            <div className="h-10 w-10 rounded-full bg-amber-50 ring-1 ring-amber-200 flex items-center justify-center mb-1">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-600" fill="currentColor">
                <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
              </svg>
            </div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Fast Response</div>
          </div>
        </div>
      </section>

      {/* About / Why Choose Us */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-3">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-slate-400 mb-3">About Us</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-5">
              Why homeowners choose {business.name}
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-4">
              {theme.tagline}. As a trusted {theme.label.toLowerCase()} provider, we focus on quality
              workmanship, honest communication, and treating every home like it’s our own.
            </p>
            <p className="text-slate-600 leading-relaxed">
              From the first call to the final walkthrough, our team is committed to making the
              process simple, transparent, and stress-free.
            </p>
          </div>
          <ul className="lg:col-span-2 space-y-4">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 bg-slate-50 ring-1 ring-slate-200 rounded-2xl p-4">
                <div className="h-9 w-9 rounded-xl bg-white ring-1 ring-slate-200 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-slate-800 font-semibold leading-snug pt-1">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Services */}
      {business.categories && business.categories.length > 0 && (
        <section className="bg-slate-50 px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-slate-400 mb-3">Our Services</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">What we do</h2>
            <p className="text-slate-500 mb-10">A full range of {theme.label.toLowerCase()} for your home.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {business.categories.map((cat) => {
                const desc = SERVICE_DESCRIPTIONS[cat]
                return (
                  <div
                    key={cat}
                    className="bg-white rounded-2xl p-6 ring-1 ring-slate-200 hover:ring-slate-300 hover:shadow-md transition-all"
                  >
                    <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center text-2xl mb-4">
                      {theme.icon}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1.5">{cat}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {desc ?? `Professional ${cat.toLowerCase()} delivered with care.`}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Service Area */}
      {serviceAreaCities.length > 0 && (
        <section className="bg-white px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-slate-400 mb-3">Service Area</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">Proudly serving local homeowners</h2>
            <p className="text-slate-500 mb-8">We cover the following areas and surrounding neighborhoods.</p>
            <div className="bg-slate-50 ring-1 ring-slate-200 rounded-2xl p-6 flex flex-wrap gap-2.5">
              {serviceAreaCities.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white ring-1 ring-slate-200 text-sm font-semibold text-slate-700 capitalize"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="bg-slate-50 px-6 py-14">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Contact & Location</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-4 bg-white rounded-2xl p-5 ring-1 ring-slate-200 hover:ring-slate-300 hover:shadow-sm transition-all group"
              >
                <div className="h-11 w-11 rounded-xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center flex-shrink-0 transition-colors">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-medium mb-0.5">Phone</p>
                  <p className="text-slate-900 font-semibold truncate">{business.phone}</p>
                </div>
              </a>
            )}
            {business.address && (
              <a
                href={mapsUrl ?? '#'}
                target={mapsUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-white rounded-2xl p-5 ring-1 ring-slate-200 hover:ring-slate-300 hover:shadow-sm transition-all group"
              >
                <div className="h-11 w-11 rounded-xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center flex-shrink-0 transition-colors">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-medium mb-0.5">Address</p>
                  <p className="text-slate-900 font-semibold text-sm leading-snug">{business.address}</p>
                </div>
              </a>
            )}
          </div>

          {/* Yelp link for Yelp-sourced businesses */}
          {business.url && (
            <div className="mt-6">
              <a
                href={business.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800"
              >
                View on Yelp
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7" /><path d="M8 7h9v9" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-slate-400 mb-3">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-10">Frequently asked questions</h2>
          <div className="divide-y divide-slate-200 ring-1 ring-slate-200 rounded-2xl bg-white overflow-hidden">
            {faqs.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex items-center justify-between gap-4 px-5 py-5 cursor-pointer list-none hover:bg-slate-50">
                  <span className="font-semibold text-slate-900">{f.q}</span>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-180 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 -mt-1 text-slate-600 leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={`relative bg-gradient-to-br ${theme.gradient} px-6 py-20 overflow-hidden`}>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Ready to get started?
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Reach out today for a free quote. We’re here to help with whatever your home needs.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm shadow-lg transition-all ${theme.accent} ${theme.accentText}`}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
                </svg>
                {business.phone ? `Call ${business.phone}` : 'Call Now'}
              </a>
            )}
            {business.websiteUrl && (
              <a
                href={business.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/20 transition-all"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 px-6 py-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm mb-4">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Powered by HomeHelp
        </Link>
        <p className="text-white/25 text-xs">
          Find trusted home service pros in your area
        </p>
      </footer>
    </div>
  )
}
