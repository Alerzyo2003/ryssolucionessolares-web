import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Bricolage_Grotesque } from 'next/font/google'
import { MapPin, Zap, ShieldCheck, MessageCircle, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['700', '800'] })

export const metadata: Metadata = {
  title: 'Proyectos realizados | R&S Soluciones Solares',
  description: 'Instalaciones solares reales en hogares, comercios y parcelas de Chile: sistemas on-grid, híbridos y con baterías.',
}

const WHATSAPP_URL = `https://wa.me/56991363439?text=${encodeURIComponent('Hola, vi sus proyectos en la web y quiero cotizar un sistema solar')}`

type Project = {
  id: string
  title: string
  tipo: string | null
  comuna: string | null
  region: string | null
  kwp: string | null
  extra: string | null
  description: string | null
  image_url: string
  inverter_image_url: string | null
  images: string[] | null
}

export default async function ProyectosPage() {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  const projects = (data || []) as Project[]

  return (
    <main className="min-h-screen bg-[#F6F8FB] pb-20 text-slate-800">
      <section className="bg-[#071A30] py-16 text-white md:py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="text-sm font-medium text-amber-300">Instalaciones reales</p>
          <h1 className={`${display.className} mt-3 text-4xl font-extrabold tracking-tight md:text-6xl`}>Proyectos realizados</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Hogares, comercios y parcelas que ya generan su propia energía con sistemas diseñados e instalados por nuestro equipo.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        {projects.length === 0 ? (
          <p className="rounded-3xl bg-white p-12 text-center text-slate-500 ring-1 ring-slate-200">Pronto publicaremos nuestros proyectos.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {projects.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
                <div className={`relative grid aspect-[16/10] gap-1 ${p.inverter_image_url ? 'grid-cols-3' : 'grid-cols-1'}`}>
                  <div className={`relative overflow-hidden ${p.inverter_image_url ? 'col-span-2' : ''}`}>
                    <Image src={p.image_url} alt={p.title} fill sizes="(max-width: 768px) 66vw, 33vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071A30]/75 via-transparent to-transparent" />
                    {p.tipo && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#0A2A4A]">{p.tipo}</span>}
                    {(p.comuna || p.region) && (
                      <div className="absolute bottom-3 left-3 text-white">
                        {p.comuna && <p className="flex items-center gap-1.5 text-sm font-bold"><MapPin className="h-4 w-4 text-amber-300" /> {p.comuna}</p>}
                        {p.region && <p className="text-xs text-slate-200">{p.region}</p>}
                      </div>
                    )}
                  </div>
                  {p.inverter_image_url && (
                    <div className="relative overflow-hidden">
                      <Image src={p.inverter_image_url} alt={`Inversor del proyecto ${p.title}`} fill sizes="(max-width: 768px) 33vw, 16vw" className="object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-[#0A2A4A]/85 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-white">Inversor</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h2 className={`${display.className} text-2xl font-extrabold text-[#0A2A4A]`}>{p.title}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.kwp && <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700"><Zap className="h-3.5 w-3.5" /> {p.kwp}</span>}
                    {p.extra && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> {p.extra}</span>}
                  </div>
                  {p.description && <p className="mt-3 leading-relaxed text-slate-600">{p.description}</p>}

                  {p.images && p.images.length > 0 && (
                    <div className="mt-5 grid grid-cols-4 gap-2">
                      {p.images.map((src) => (
                        <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-slate-200">
                          <Image src={src} alt="" fill sizes="120px" className="object-cover transition-transform duration-300 hover:scale-110" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 grid gap-3 rounded-3xl bg-[#0A2A4A] p-6 text-white sm:grid-cols-3 md:p-8">
          {[
            ['Pagas al terminar', 'Una vez instalado y revisado tu equipo.'],
            ['Sin abonos', 'No pedimos pagos por adelantado.'],
            ['Financiamiento disponible', 'Contado, transferencia o tarjeta de crédito.'],
          ].map(([t, d]) => (
            <div key={t} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 flex-none text-amber-400" />
              <p className="text-sm"><span className="block font-bold">{t}</span><span className="text-slate-300">{d}</span></p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-7 py-4 text-sm font-semibold text-white transition hover:bg-orange-500">
            <MessageCircle className="h-4 w-4" /> Quiero un proyecto como estos
          </a>
          <p className="mt-3 text-sm text-slate-500">
            o revisa nuestros <Link href="/tienda" className="font-semibold text-orange-600 hover:underline">equipos en la tienda</Link>
          </p>
        </div>
      </div>
    </main>
  )
}