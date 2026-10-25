import type { Metadata } from 'next'
import Link from 'next/link'
import { Bricolage_Grotesque } from 'next/font/google'
import { ChevronRight, MessageCircle, RotateCcw, ShieldCheck, Wrench, Truck, ClipboardList, AlertTriangle } from 'lucide-react'

const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['700', '800'] })

export const metadata: Metadata = {
  title: 'Política de devoluciones y garantías | R&S Soluciones Solares',
  description: 'Derecho a retracto, garantía legal, garantía de fábrica y cómo solicitar un cambio o devolución en R&S Soluciones Solares.',
  alternates: { canonical: '/politica-de-devoluciones' },
}

const WHATSAPP_URL = `https://wa.me/56991363439?text=${encodeURIComponent('Hola, quiero solicitar un cambio o devolución. Mi número de orden es: ')}`
const UPDATED = '25 de octubre de 2026'

const sections = [
  {
    id: 'retracto',
    Icon: RotateCcw,
    title: 'Derecho a retracto (10 días)',
    body: [
      'Si compraste en nuestra tienda en línea, puedes arrepentirte de la compra dentro de los 10 días siguientes a la recepción del producto, sin necesidad de dar un motivo, según el artículo 3 bis de la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.',
      'Para ejercerlo, el producto debe estar sin uso, sin instalar y con su embalaje original, manuales y accesorios completos.',
      'Te devolvemos el monto pagado por el mismo medio de pago, en un plazo máximo de 10 días hábiles desde que recibimos el producto de vuelta.',
    ],
  },
  {
    id: 'garantia-legal',
    Icon: ShieldCheck,
    title: 'Garantía legal (6 meses)',
    body: [
      'Si un producto presenta fallas de fabricación o no corresponde a lo comprado, dentro de los 6 meses siguientes a su recepción puedes elegir entre la reparación gratuita, el cambio por otro igual o la devolución del dinero.',
      'Para evaluarlo te pediremos fotos o un video de la falla y, si corresponde, revisaremos el equipo con nuestro equipo técnico.',
    ],
  },
  {
    id: 'garantia-fabrica',
    Icon: ClipboardList,
    title: 'Garantía del fabricante',
    body: [
      'Además de la garantía legal, los equipos cuentan con la garantía de su fabricante, cuyo plazo depende de la marca y del producto (por ejemplo, paneles con garantía de rendimiento de hasta 25 años y equipos Victron con 5 años). El plazo exacto se indica en la ficha de cada producto.',
      'Nosotros gestionamos el reclamo ante el fabricante por ti.',
    ],
  },
  {
    id: 'instalados',
    Icon: Wrench,
    title: 'Equipos instalados y proyectos a medida',
    body: [
      'Los equipos ya instalados no pueden devolverse por retracto, ya que la instalación implica su uso. Siguen cubiertos por la garantía legal y la del fabricante ante fallas.',
      'Los proyectos e instalaciones contratados mediante cotización se rigen por lo acordado en esa cotización. Recuerda que no pedimos abonos: pagas una vez instalado y revisado tu equipo.',
      'Nuestra instalación tiene garantía propia de mano de obra; si detectas un problema atribuible a la instalación, contáctanos y lo revisamos sin costo.',
    ],
  },
  {
    id: 'envios',
    Icon: Truck,
    title: 'Costos de envío',
    body: [
      'En devoluciones por retracto, el costo del envío de vuelta es de cargo del cliente.',
      'En devoluciones o cambios por falla, error en el despacho o producto distinto al comprado, todos los costos de envío son de nuestro cargo.',
    ],
  },
  {
    id: 'excepciones',
    Icon: AlertTriangle,
    title: 'Casos no cubiertos',
    body: [
      'Daños causados por mala manipulación, golpes, instalación hecha por terceros no autorizados, conexión eléctrica incorrecta, sobrecargas o modificaciones del equipo.',
      'Desgaste normal por uso o productos a los que les falten piezas, accesorios o embalaje (en el caso de retracto).',
    ],
  },
]

const steps = [
  'Escríbenos por WhatsApp o desde la página de contacto con tu número de orden y el motivo.',
  'Si es por falla, adjunta fotos o un video del problema.',
  'Te confirmamos si aplica y te indicamos cómo y dónde enviar o entregar el producto.',
  'Revisamos el producto y realizamos el cambio, la reparación o el reembolso.',
]

export default function PoliticaDevolucionesPage() {
  return (
    <main className="min-h-screen bg-[#F6F8FB] pb-24 text-slate-800">
      <section className="bg-[#071A30] py-14 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <nav aria-label="Ruta de navegación" className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-amber-300">Inicio</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-200">Política de devoluciones</span>
          </nav>
          <h1 className={`${display.className} text-4xl font-extrabold tracking-tight md:text-5xl`}>Política de devoluciones y garantías</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Queremos que compres con tranquilidad. Aquí te explicamos cuándo puedes devolver un producto, qué cubre la garantía y cómo solicitarlo.
          </p>
          <p className="mt-3 text-xs text-slate-400">Última actualización: {UPDATED}</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-5 px-5 py-12 md:px-8">
        {sections.map(({ id, Icon, title, body }) => (
          <section key={id} id={id} className="scroll-mt-28 rounded-3xl bg-white p-6 ring-1 ring-slate-200 md:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className={`${display.className} text-xl font-extrabold text-[#0A2A4A] md:text-2xl`}>{title}</h2>
            </div>
            <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-slate-600">
              {body.map((p) => <p key={p}>{p}</p>)}
            </div>
          </section>
        ))}

        <section id="como-solicitar" className="scroll-mt-28 rounded-3xl bg-[#0A2A4A] p-6 text-white md:p-8">
          <h2 className={`${display.className} text-xl font-extrabold md:text-2xl`}>¿Cómo solicitar un cambio o devolución?</h2>
          <ol className="mt-5 space-y-3">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-3 text-sm text-slate-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-[#0A2A4A]">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold transition hover:bg-emerald-600">
              <MessageCircle className="h-4 w-4" /> Solicitar por WhatsApp
            </a>
            <Link href="/contacto" className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold transition hover:bg-white/10">
              Ir a contacto
            </Link>
          </div>
        </section>

        <p className="px-1 text-xs leading-relaxed text-slate-500">
          Esta política no limita los derechos que te otorga la Ley N° 19.496. Ante cualquier diferencia, prevalece lo que establece la ley.
        </p>
      </div>
    </main>
  )
}
