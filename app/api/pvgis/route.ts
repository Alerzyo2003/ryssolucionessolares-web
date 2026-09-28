import { NextResponse } from 'next/server'

// Rendimiento real de 1 kWp en la coordenada, con inclinación/orientación óptimas (hemisferio sur => norte)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get('lat'))
  const lon = Number(searchParams.get('lon'))

  // Límites aproximados de Chile (incluye Isla de Pascua y Antártica chilena no cubierta)
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -56 || lat > -17 || lon < -110 || lon > -66) {
    return NextResponse.json({ error: 'Coordenadas fuera de Chile' }, { status: 400 })
  }

  const url =
    `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}` +
    `&peakpower=1&loss=14&optimalangles=1&outputformat=json`

  try {
    const r = await fetch(url, { next: { revalidate: 60 * 60 * 24 }, signal: AbortSignal.timeout(15000) })
    if (!r.ok) throw new Error('PVGIS ' + r.status)
    const j = await r.json()

    return NextResponse.json({
      yield: j.outputs.totals.fixed.E_y as number, // kWh/kWp/año
      monthly: (j.outputs.monthly.fixed as any[]).map((m) => m.E_m as number), // kWh/kWp por mes
      slope: j.inputs.mounting_system.fixed.slope.value as number,
      azimuth: j.inputs.mounting_system.fixed.azimuth.value as number,
    })
  } catch {
    return NextResponse.json({ error: 'PVGIS no disponible' }, { status: 502 })
  }
}