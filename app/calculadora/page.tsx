'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Calculator, MapPin, Zap, Sun, DollarSign, ArrowRight, Info, PanelTop,
  Pencil, Check, Trash2, Undo2, Leaf, Loader2, Search,
} from 'lucide-react'

// ---------- Supuestos (Chile, residencial / pyme, Net Billing Ley 21.118) ----------
const PANEL_W = 550
const PANEL_AREA = 2.58
const FACTOR_TECHO = { inclinado: 0.75, plano: 0.45 }
const AUTOCONSUMO = 0.5
const PRECIO_INYECCION = 70
const CO2_KG_KWH = 0.35

const TABLA_LAT: [number, number][] = [
  [-18, 2150], [-23, 2250], [-27, 2100], [-30, 1900], [-33.5, 1700],
  [-37, 1450], [-41, 1200], [-45, 1050], [-53, 950],
]
function yieldPorLatitud(lat: number) {
  const l = Math.min(Math.max(lat, -53), -18)
  for (let i = 0; i < TABLA_LAT.length - 1; i++) {
    const [l1, y1] = TABLA_LAT[i]
    const [l2, y2] = TABLA_LAT[i + 1]
    if (l <= l1 && l >= l2) return y1 + ((l - l1) / (l2 - l1)) * (y2 - y1)
  }
  return 1700
}

function costoPorKwp(kwp: number) {
  if (kwp <= 5) return 1_300_000
  if (kwp <= 15) return 1_100_000
  return 950_000
}

// Área geodésica aproximada de un polígono (m²) — fórmula esférica, suficiente para techos
function areaPoligono(pts: { lat: number; lng: number }[]) {
  if (pts.length < 3) return 0
  const R = 6378137
  const rad = Math.PI / 180
  let sum = 0
  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i]
    const p2 = pts[(i + 1) % pts.length]
    sum += (p2.lng - p1.lng) * rad * (2 + Math.sin(p1.lat * rad) + Math.sin(p2.lat * rad))
  }
  return Math.abs((sum * R * R) / 2)
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const clp = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
const num = (n: number, d = 0) => new Intl.NumberFormat('es-CL', { maximumFractionDigits: d }).format(n)
const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type Pv = { yield: number; monthly: number[] | null; slope: number | null; azimuth: number | null; fuente: 'PVGIS' | 'estimación' }
type Resultado = {
  display_name: string
  lat: string
  lon: string
  addresstype?: string
  type?: string
}

export default function CalculadoraPage() {
  const [gasto, setGasto] = useState(60000)
  const [tarifa, setTarifa] = useState(180)
  const [techo, setTecho] = useState<'inclinado' | 'plano'>('inclinado')

  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [buscando, setBuscando] = useState(false)
  const [busquedaMsg, setBusquedaMsg] = useState('')
  const [direccion, setDireccion] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [pv, setPv] = useState<Pv | null>(null)
  const [pvLoading, setPvLoading] = useState(false)

  const [dibujando, setDibujando] = useState(false)
  const [areaM2, setAreaM2] = useState(0)

  const mapDivRef = useRef<HTMLDivElement>(null)
  const ultimaBusquedaRef = useRef(0)
  const mapRef = useRef<any>(null)
  const LRef = useRef<any>(null)
  const polysRef = useRef<any[]>([])
  const currentRef = useRef<any>(null)
  const pointsRef = useRef<any[]>([])
  const vertexRef = useRef<any[]>([])
  const dibujandoRef = useRef(false)
  const markerRef = useRef<any>(null)

  // ---------- Mapa ----------
  useEffect(() => {
    let cancelled = false
    let map: any
    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled || !mapDivRef.current) return
      LRef.current = L

      map = L.map(mapDivRef.current, { zoomControl: true }).setView([-33.5, -70.7], 5)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 21,
        maxNativeZoom: 19,
        attribution: 'Tiles © Esri — Esri, Maxar, Earthstar Geographics, and the GIS User Community',
      }).addTo(map)
      mapRef.current = map

      map.on('click', (e: any) => {
        if (!dibujandoRef.current) return
        pointsRef.current.push(e.latlng)
        const v = L.circleMarker(e.latlng, { radius: 4, color: '#fff', weight: 1, fillColor: '#f97316', fillOpacity: 1, interactive: false }).addTo(map)
        vertexRef.current.push(v)
        currentRef.current?.setLatLngs(pointsRef.current)
      })
    })()
    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
    }
  }, [])

  // ---------- PVGIS ----------
  useEffect(() => {
    if (!coords) return
    const ctrl = new AbortController()
    setPvLoading(true)
    fetch(`/api/pvgis?lat=${coords.lat}&lon=${coords.lng}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setPv({ ...d, fuente: 'PVGIS' }))
      .catch((e) => {
        if (e?.name === 'AbortError') return
        setPv({ yield: yieldPorLatitud(coords.lat), monthly: null, slope: null, azimuth: null, fuente: 'estimación' })
      })
      .finally(() => setPvLoading(false))
    return () => ctrl.abort()
  }, [coords])

  // ---------- Búsqueda de dirección (Nominatim: máx. 1 consulta por segundo) ----------
  const buscar = async () => {
    const q = query.trim()
    if (q.length < 4) {
      setBusquedaMsg('Escribe al menos 4 caracteres, idealmente calle, número y comuna.')
      setResultados([])
      return
    }

    setBuscando(true)
    setBusquedaMsg('')
    setResultados([])
    try {
      const tiempoRestante = 1000 - (Date.now() - ultimaBusquedaRef.current)
      if (ultimaBusquedaRef.current && tiempoRestante > 0) await esperar(tiempoRestante)
      ultimaBusquedaRef.current = Date.now()

      const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`, { cache: 'no-store' })
      const payload: unknown = await r.json()
      if (!r.ok) {
        const error = payload && typeof payload === 'object' && 'error' in payload
          ? String(payload.error)
          : 'No se pudo buscar esa dirección.'
        throw new Error(error)
      }
      if (!Array.isArray(payload)) throw new Error('El buscador recibió una respuesta inesperada.')

      const data = payload as Resultado[]
      if (!data.length) {
        setBusquedaMsg('No encontré esa dirección. Prueba con calle, número y comuna o una referencia cercana.')
      }
      setResultados(data)
    } catch (error) {
      setBusquedaMsg(error instanceof Error ? error.message : 'Error al buscar. Intenta de nuevo en unos segundos.')
    } finally {
      setBuscando(false)
    }
  }

  const elegirResultado = (res: Resultado) => {
    const L = LRef.current
    const map = mapRef.current
    const c = { lat: Number(res.lat), lng: Number(res.lon) }
    const esDireccionExacta = res.addresstype === 'house' || res.type === 'house'
    setDireccion(esDireccionExacta ? res.display_name : `Ubicación aproximada: ${res.display_name}`)
    setCoords(c)
    setResultados([])
    if (!L || !map) return
    map.setView([c.lat, c.lng], esDireccionExacta ? 19 : 16)
    markerRef.current?.remove()
    markerRef.current = L.circleMarker([c.lat, c.lng], { radius: 6, color: '#fff', weight: 2, fillColor: '#f97316', fillOpacity: 1, interactive: false }).addTo(map)
  }

  // ---------- Dibujo del techo ----------
  const recalcArea = () => {
    const total = polysRef.current.reduce((acc, p) => acc + areaPoligono(p.getLatLngs()[0]), 0)
    setAreaM2(total)
  }

  const iniciarDibujo = () => {
    const L = LRef.current
    const map = mapRef.current
    if (!L || !map) return
    pointsRef.current = []
    currentRef.current = L.polygon([], { color: '#f97316', weight: 2, fillColor: '#f97316', fillOpacity: 0.3, interactive: false }).addTo(map)
    dibujandoRef.current = true
    setDibujando(true)
  }

  const terminarDibujo = () => {
    const poly = currentRef.current
    dibujandoRef.current = false
    setDibujando(false)
    vertexRef.current.forEach((v) => v.remove())
    vertexRef.current = []
    if (poly) {
      if (pointsRef.current.length < 3) poly.remove()
      else polysRef.current.push(poly)
    }
    currentRef.current = null
    pointsRef.current = []
    recalcArea()
  }

  const deshacerPunto = () => {
    pointsRef.current.pop()
    vertexRef.current.pop()?.remove()
    currentRef.current?.setLatLngs(pointsRef.current)
  }

  const borrarTodo = () => {
    polysRef.current.forEach((p) => p.remove())
    currentRef.current?.remove()
    vertexRef.current.forEach((v) => v.remove())
    polysRef.current = []
    vertexRef.current = []
    pointsRef.current = []
    currentRef.current = null
    dibujandoRef.current = false
    setDibujando(false)
    setAreaM2(0)
  }

  // ---------- Cálculo ----------
  const calc = useMemo(() => {
    const yieldKwp = pv?.yield ?? yieldPorLatitud(coords?.lat ?? -33.45)
    const consumoMes = gasto / tarifa
    const consumoAnual = consumoMes * 12

    const kwpNecesario = consumoAnual / yieldKwp
    const panelesNecesarios = Math.max(1, Math.ceil((kwpNecesario * 1000) / PANEL_W))

    const areaUtil = areaM2 * FACTOR_TECHO[techo]
    const panelesMax = areaM2 > 0 ? Math.floor(areaUtil / PANEL_AREA) : null
    const paneles = panelesMax === null ? panelesNecesarios : Math.min(panelesNecesarios, panelesMax)
    const limitadoPorTecho = panelesMax !== null && panelesMax < panelesNecesarios

    const kwp = (paneles * PANEL_W) / 1000
    const produccionAnual = kwp * yieldKwp
    const cobertura = consumoAnual > 0 ? Math.min(produccionAnual / consumoAnual, 1.2) : 0

    const autoconsumo = Math.min(produccionAnual * AUTOCONSUMO, consumoAnual)
    const inyectado = produccionAnual - autoconsumo
    const restante = consumoAnual - autoconsumo
    const ahorroAnual = autoconsumo * tarifa + Math.min(inyectado * PRECIO_INYECCION, restante * tarifa)

    const costo = Math.round((kwp * costoPorKwp(kwp)) / 10000) * 10000
    const retorno = ahorroAnual > 0 ? costo / ahorroAnual : 0
    const co2Ton = (Math.min(produccionAnual, consumoAnual) * CO2_KG_KWH) / 1000
    const mensual = pv?.monthly ? pv.monthly.map((m) => m * kwp) : null

    return {
      consumoMes, panelesNecesarios, panelesMax, paneles, limitadoPorTecho, kwp, produccionAnual,
      cobertura, ahorroAnual, costo, retorno, co2Ton, mensual, areaUtil,
    }
  }, [gasto, tarifa, techo, areaM2, pv, coords])

  const maxBar = calc.mensual ? Math.max(...calc.mensual, calc.consumoMes) : 0

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <section className="bg-[#0B1221] text-white pt-20 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-6">
            <Calculator className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Simulador Solar</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Simula tu proyecto solar sobre <span className="text-orange-500">tu propio techo</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Busca tu dirección, dibuja el área disponible en el mapa y calcula paneles, producción y ahorro con datos reales de radiación.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
          {/* IZQUIERDA */}
          <div className="w-full lg:w-7/12 bg-slate-50/50 p-6 md:p-8 border-r border-slate-100 space-y-6">
            {/* Paso 1 */}
            <div>
              <h3 className="text-lg font-extrabold text-[#0F172A] mb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">1</span>
                Busca tu dirección
              </h3>
              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setBusquedaMsg('')
                    setResultados([])
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void buscar()
                    }
                  }}
                  placeholder="Ej: Av. Santa Rosa 1234, La Pintana"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button type="button" onClick={() => void buscar()} disabled={buscando}
                  className="inline-flex items-center gap-1.5 px-4 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 disabled:opacity-50 transition">
                  {buscando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Buscar
                </button>
              </div>

              {resultados.length > 0 && (
                <ul className="mt-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  {resultados.map((r, i) => (
                    <li key={i}>
                      <button onClick={() => elegirResultado(r)}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-orange-50 border-b border-slate-100 last:border-0">
                        <span className="block">{r.display_name}</span>
                        {r.addresstype !== 'house' && r.type !== 'house' && (
                          <span className="mt-1 block text-[10px] font-semibold uppercase text-amber-700">
                            Punto aproximado; no se encontró el número exacto
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {busquedaMsg && <p className="mt-2 text-xs text-amber-700">{busquedaMsg}</p>}
              {direccion && (
                <p className="mt-2 text-xs text-slate-500 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" /> {direccion}
                </p>
              )}
            </div>

            {/* Paso 2 */}
            <div>
              <h3 className="text-lg font-extrabold text-[#0F172A] mb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">2</span>
                Marca el área del techo
              </h3>

              <div className="flex flex-wrap gap-2 mb-3">
                {!dibujando ? (
                  <button onClick={iniciarDibujo} disabled={!coords}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold disabled:opacity-40 hover:bg-orange-700 transition">
                    <Pencil className="w-3.5 h-3.5" /> {polysRef.current.length ? 'Agregar otra área' : 'Dibujar techo'}
                  </button>
                ) : (
                  <>
                    <button onClick={terminarDibujo}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition">
                      <Check className="w-3.5 h-3.5" /> Terminar área
                    </button>
                    <button onClick={deshacerPunto}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition">
                      <Undo2 className="w-3.5 h-3.5" /> Deshacer punto
                    </button>
                  </>
                )}
                <button onClick={borrarTodo}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition">
                  <Trash2 className="w-3.5 h-3.5" /> Borrar
                </button>
              </div>

              <div className="relative z-0 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-[420px]">
                <div ref={mapDivRef} className="w-full h-full" />
                {dibujando && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full pointer-events-none">
                    Haz clic en las esquinas del techo y luego “Terminar área”
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                <div className="bg-white border border-slate-200 rounded-xl p-3">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Área dibujada</p>
                  <p className="text-lg font-black text-[#0F172A]">{areaM2 > 0 ? `${num(areaM2)} m²` : '—'}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Área útil para paneles</p>
                  <p className="text-lg font-black text-[#0F172A]">{areaM2 > 0 ? `${num(calc.areaUtil)} m²` : '—'}</p>
                </div>
              </div>
            </div>

            {/* Paso 3 */}
            <div>
              <h3 className="text-lg font-extrabold text-[#0F172A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">3</span>
                Tu consumo eléctrico
              </h3>

              <label className="flex justify-between items-end mb-3">
                <span className="text-sm font-bold text-slate-700">Gasto mensual en luz</span>
                <span className="text-xl font-black text-orange-600">{clp(gasto)}</span>
              </label>
              <input type="range" min={20000} max={1000000} step={5000} value={gasto}
                onChange={(e) => setGasto(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600" />
              <div className="flex justify-between text-xs font-semibold text-slate-400 mt-2 mb-4">
                <span>$20.000</span><span>$1.000.000</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Tarifa ($/kWh, ver boleta)</label>
                  <input type="number" min={80} max={400} value={tarifa}
                    onChange={(e) => setTarifa(Math.max(80, Number(e.target.value) || 180))}
                    className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Tipo de techo</label>
                  <select value={techo} onChange={(e) => setTecho(e.target.value as any)}
                    className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="inclinado">Inclinado (zinc, teja)</option>
                    <option value="plano">Plano (losa)</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Consumo estimado: <strong className="text-slate-700">{num(calc.consumoMes)} kWh/mes</strong>
              </p>
            </div>
          </div>

          {/* DERECHA */}
          <div className="w-full lg:w-5/12 p-6 md:p-8 flex flex-col bg-white">
            <h3 className="text-lg font-extrabold text-[#0F172A] mb-5 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">4</span>
              Tu sistema
              {pvLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            </h3>

            <div className="bg-gradient-to-br from-[#0F172A] to-slate-800 rounded-2xl p-6 text-white mb-4 relative overflow-hidden shadow-lg">
              <p className="text-slate-400 font-semibold text-xs mb-1 uppercase tracking-wide">Inversión estimada *</p>
              <div className="text-4xl font-black">{clp(calc.costo)}</div>
              <div className="mt-4 flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                <span className="text-xs text-slate-300 font-bold">RECUPERACIÓN APROX.</span>
                <span className="text-xl font-black text-emerald-400">{calc.retorno ? `${num(calc.retorno, 1)} años` : '—'}</span>
              </div>
            </div>

            {calc.limitadoPorTecho && (
              <div className="mb-4 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3">
                Tu techo permite <strong>{calc.panelesMax}</strong> paneles, pero para cubrir todo tu consumo necesitarías{' '}
                <strong>{calc.panelesNecesarios}</strong>. El sistema se dimensionó según el área disponible.
              </div>
            )}
            {areaM2 === 0 && (
              <div className="mb-4 text-xs bg-slate-50 border border-slate-200 text-slate-600 rounded-xl p-3">
                Dibuja tu techo para limitar los paneles al espacio real. Por ahora se muestra el sistema necesario para cubrir tu consumo.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Stat icon={<PanelTop className="w-7 h-7 text-orange-500" />} value={`${calc.paneles}`} label={`Paneles de ${PANEL_W} W`} />
              <Stat icon={<Zap className="w-7 h-7 text-orange-500" />} value={`${num(calc.kwp, 2)} kWp`} label="Potencia instalada" />
              <Stat icon={<Sun className="w-7 h-7 text-orange-500" />} value={`${num(calc.produccionAnual)} kWh`} label="Producción anual" />
              <Stat icon={<DollarSign className="w-7 h-7 text-emerald-500" />} value={clp(calc.ahorroAnual)} label="Ahorro anual" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cobertura de tu consumo</p>
                <p className="text-2xl font-black text-[#0F172A]">{num(calc.cobertura * 100)}%</p>
                <div className="h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${Math.min(calc.cobertura, 1) * 100}%` }} />
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Leaf className="w-3 h-3" /> CO₂ evitado</p>
                <p className="text-2xl font-black text-[#0F172A]">{num(calc.co2Ton, 1)} t/año</p>
              </div>
            </div>

            {calc.mensual && (
              <div className="mb-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Producción mensual vs. consumo</p>
                <div className="flex items-end gap-1 h-24 relative">
                  {calc.mensual.map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div className="w-full bg-orange-400 rounded-t" style={{ height: `${(m / maxBar) * 100}%` }} title={`${MESES[i]}: ${num(m)} kWh`} />
                    </div>
                  ))}
                  <div className="absolute left-0 right-0 border-t border-dashed border-slate-500"
                    style={{ bottom: `${(calc.consumoMes / maxBar) * 100}%` }} />
                </div>
                <div className="flex gap-1 mt-1">
                  {MESES.map((m) => <span key={m} className="flex-1 text-center text-[9px] text-slate-400 font-semibold">{m}</span>)}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Línea punteada: tu consumo mensual promedio.</p>
              </div>
            )}

            <a
              href="https://wa.me/56991363439?text=Hola%2C%20quiero%20una%20cotizaci%C3%B3n%20para%20un%20sistema%20solar."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-2xl px-5 py-4 transition-colors mb-5">
              <span className="text-sm font-extrabold text-orange-600">Obtener cotización formal</span>
              <span className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-white px-3 py-1.5 rounded-full shadow-sm">
                Contactar asesor <ArrowRight className="w-3 h-3" />
              </span>
            </a>

            <div className="flex gap-2 items-start text-slate-400 mt-auto">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                * Estimación referencial para sistemas on-grid con Net Billing (Ley 21.118), instalación estándar y trámite SEC.
                Producción calculada con {pv?.fuente === 'PVGIS' ? 'PVGIS (JRC, Comisión Europea)' : 'una estimación por latitud'}
                {pv?.slope != null && ` con inclinación óptima de ${num(pv.slope)}° orientada al norte`}, pérdidas del sistema de 14%.
                Supone {AUTOCONSUMO * 100}% de autoconsumo directo y ${PRECIO_INYECCION}/kWh por energía inyectada. El valor final depende de
                sombras, estado del techo, tarifa de tu distribuidora y equipos elegidos. Requiere visita técnica.
                Direcciones: © OpenStreetMap contributors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center">
      <div className="mb-2">{icon}</div>
      <p className="text-lg font-black text-[#0F172A] leading-tight">{value}</p>
      <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{label}</p>
    </div>
  )
}