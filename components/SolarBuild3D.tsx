'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/* ---------- utilidades ---------- */
const clamp = (x: number) => Math.min(Math.max(x, 0), 1)
const st = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const ease = (t: number) => 1 - Math.pow(1 - t, 3)

function getPage() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  return max > 0 ? Math.min(window.scrollY / max, 1) : 0
}

/* Etapas de la obra según el scroll */
const S = {
  rails: [0.0, 0.15],
  frame: [0.15, 0.28],
  cells: [0.28, 0.78],
  glass: [0.78, 0.86],
  cable: [0.86, 0.95],
  done: [0.95, 1.0],
} as const

/* ---------- medidas del panel (60 celdas, 6 x 10) ---------- */
const COLS = 6, ROWS = 10, CELL = 0.155, GAP = 0.006, PAD = 0.03
const PW = COLS * CELL + (COLS - 1) * GAP + PAD * 2 // ancho
const PL = ROWS * CELL + (ROWS - 1) * GAP + PAD * 2 // largo
const ROOF_Y = -0.125

/* Textura de celda monocristalina: dedos, busbars y esquinas recortadas */
function makeCellTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grd = g.createLinearGradient(0, 0, 128, 128)
  grd.addColorStop(0, '#1b2f5e')
  grd.addColorStop(1, '#0a1530')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  g.strokeStyle = 'rgba(180,195,220,.18)'
  g.lineWidth = 1
  for (let y = 4; y < 128; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(128, y); g.stroke() }
  g.fillStyle = '#c7ced8'
  ;[32, 64, 96].forEach((x) => g.fillRect(x - 1.5, 0, 3, 128))
  g.fillStyle = '#f1f5f9'
  const k = 14
  const corners = [[0, 0, k, 0, 0, k], [128, 0, 128 - k, 0, 128, k], [0, 128, k, 128, 0, 128 - k], [128, 128, 128 - k, 128, 128, 128 - k]]
  corners.forEach(([a, b, c2, d, e, f]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c2, d); g.lineTo(e, f); g.fill() })
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

/* Textura de tejas para el techo */
function makeRoofTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  g.fillStyle = '#8f4a33'
  g.fillRect(0, 0, 256, 256)
  for (let y = 0; y < 256; y += 32) {
    for (let x = (y / 32) % 2 ? -16 : 0; x < 256; x += 32) {
      const grd = g.createLinearGradient(0, y, 0, y + 32)
      grd.addColorStop(0, '#a85a3e')
      grd.addColorStop(1, '#6e3524')
      g.fillStyle = grd
      g.beginPath()
      g.roundRect(x + 1, y + 1, 30, 30, 10)
      g.fill()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(3, 3)
  return t
}

/* ---------- escena ---------- */
function Scene() {
  const p = useRef(0)
  const assembly = useRef<THREE.Group>(null)
  const rails = useRef<THREE.Group>(null)
  const frame = useRef<THREE.Group>(null)
  const cells = useRef<(THREE.Mesh | null)[]>([])
  const glassMat = useRef<THREE.MeshPhysicalMaterial>(null)
  const clamps = useRef<THREE.Group>(null)
  const cableGeo = useRef<THREE.TubeGeometry>(null)
  const inverter = useRef<THREE.Group>(null)
  const ledMat = useRef<THREE.MeshStandardMaterial>(null)
  const sun = useRef<THREE.DirectionalLight>(null)

  const cellTex = useMemo(() => makeCellTexture(), [])
  const roofTex = useMemo(() => makeRoofTexture(), [])

  const cellPositions = useMemo(() => {
    const list: [number, number][] = []
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        list.push([
          -PW / 2 + PAD + CELL / 2 + c * (CELL + GAP),
          -PL / 2 + PAD + CELL / 2 + r * (CELL + GAP),
        ])
    return list
  }, [])

  const cablePath = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(PW / 2 - 0.06, -0.03, PL / 2 - 0.2),
        new THREE.Vector3(PW / 2 + 0.08, -0.09, PL / 2 - 0.1),
        new THREE.Vector3(PW / 2 + 0.2, -0.11, PL / 2 + 0.05),
        new THREE.Vector3(PW / 2 + 0.3, -0.1, PL / 2 + 0.1),
      ]),
    []
  )

  useFrame((state, dt) => {
    p.current = THREE.MathUtils.damp(p.current, getPage(), 6, dt)
    const P = p.current

    // 1. Rieles
    const tr = ease(st(P, ...S.rails))
    if (rails.current) {
      rails.current.visible = tr > 0.001
      rails.current.scale.set(tr, 1, 1)
    }

    // 2. Marco + lámina de fondo
    const tf = ease(st(P, ...S.frame))
    if (frame.current) {
      frame.current.visible = tf > 0.001
      frame.current.position.y = (1 - tf) * 0.8
    }

    // 3. Celdas una a una
    const on = st(P, ...S.cells) * cells.current.length
    cells.current.forEach((m, i) => {
      if (!m) return
      const t = ease(clamp(on - i))
      m.visible = t > 0.001
      m.position.y = -0.008 + (1 - t) * 0.45
      m.rotation.x = (1 - t) * 0.8
    })

    // 4. Vidrio y abrazaderas
    const tg = st(P, ...S.glass)
    if (glassMat.current) glassMat.current.opacity = tg * 0.28
    if (clamps.current) {
      const s = ease(clamp(tg * 1.5 - 0.5))
      clamps.current.visible = s > 0.001
      clamps.current.scale.setScalar(Math.max(s, 0.001))
    }

    // 5. Cable e inversor
    const tc = st(P, ...S.cable)
    if (cableGeo.current) cableGeo.current.setDrawRange(0, Math.floor((cableGeo.current.index?.count ?? 0) * tc))
    if (inverter.current) {
      const s = ease(clamp(tc * 2))
      inverter.current.visible = s > 0.001
      inverter.current.scale.setScalar(Math.max(s, 0.001))
    }

    // 6. Listo: sol fuerte, LED verde y leve giro
    const td = st(P, ...S.done)
    if (ledMat.current) ledMat.current.emissiveIntensity = td * (2 + Math.sin(state.clock.elapsedTime * 4))
    if (sun.current) sun.current.intensity = 1.4 + td * 1.8
    if (assembly.current) assembly.current.rotation.y = -0.45 + Math.sin(state.clock.elapsedTime * 0.5) * 0.12 * td
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight ref={sun} position={[3, 5, 2]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <Environment preset="city" />

      <group ref={assembly} rotation={[0.32, -0.45, 0]}>
        {/* Techo de tejas */}
        <mesh position={[0, ROOF_Y - 0.025, 0.1]} receiveShadow>
          <boxGeometry args={[2.4, 0.05, 2.8]} />
          <meshStandardMaterial map={roofTex} roughness={0.85} />
        </mesh>

        {/* 1. Rieles de aluminio con soportes */}
        <group ref={rails}>
          {[-PL / 2 + 0.35, PL / 2 - 0.35].map((z) => (
            <group key={z}>
              <mesh position={[0, -0.045, z]} castShadow>
                <boxGeometry args={[PW + 0.25, 0.03, 0.04]} />
                <meshStandardMaterial color="#b8c2cc" metalness={1} roughness={0.35} />
              </mesh>
              {[-PW / 2 + 0.1, PW / 2 - 0.1].map((x) => (
                <mesh key={x} position={[x, -0.09, z]} castShadow>
                  <boxGeometry args={[0.04, 0.07, 0.05]} />
                  <meshStandardMaterial color="#8a949e" metalness={0.9} roughness={0.4} />
                </mesh>
              ))}
            </group>
          ))}
        </group>

        {/* 2. Marco + lámina blanca */}
        <group ref={frame}>
          <mesh position={[0, -0.014, 0]} receiveShadow>
            <boxGeometry args={[PW, 0.004, PL]} />
            <meshStandardMaterial color="#eef2f6" roughness={0.6} />
          </mesh>
          {[
            [0, 0, -PL / 2, PW + 0.04, 0.04, 0.035],
            [0, 0, PL / 2, PW + 0.04, 0.04, 0.035],
            [-PW / 2, 0, 0, 0.035, 0.04, PL],
            [PW / 2, 0, 0, 0.035, 0.04, PL],
          ].map(([x, y, z, w, h, d], i) => (
            <mesh key={i} position={[x, y, z]} castShadow>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial color="#cfd6dd" metalness={1} roughness={0.3} />
            </mesh>
          ))}
        </group>

        {/* 3. Celdas */}
        {cellPositions.map(([x, z], i) => (
          <mesh key={i} ref={(m) => { cells.current[i] = m }} position={[x, 0.4, z]} visible={false} castShadow>
            <boxGeometry args={[CELL, 0.004, CELL]} />
            <meshPhysicalMaterial map={cellTex} roughness={0.25} metalness={0.4} clearcoat={1} clearcoatRoughness={0.1} />
          </mesh>
        ))}

        {/* 4. Vidrio templado */}
        <mesh position={[0, 0.012, 0]}>
          <boxGeometry args={[PW - 0.01, 0.004, PL - 0.01]} />
          <meshPhysicalMaterial ref={glassMat} color="#ffffff" transparent opacity={0} roughness={0.03} metalness={0} clearcoat={1} reflectivity={1} />
        </mesh>

        {/* Abrazaderas */}
        <group ref={clamps} visible={false}>
          {[-PL / 2 + 0.35, PL / 2 - 0.35].flatMap((z) =>
            [-PW / 2 - 0.02, PW / 2 + 0.02].map((x) => (
              <mesh key={`${x}${z}`} position={[x, 0.02, z]}>
                <boxGeometry args={[0.05, 0.02, 0.06]} />
                <meshStandardMaterial color="#9aa4ae" metalness={1} roughness={0.3} />
              </mesh>
            ))
          )}
        </group>

        {/* 5. Cable */}
        <mesh>
          <tubeGeometry ref={cableGeo} args={[cablePath, 64, 0.012, 8, false]} />
          <meshStandardMaterial color="#111827" roughness={0.5} />
        </mesh>

        {/* Inversor */}
        <group ref={inverter} position={[PW / 2 + 0.42, ROOF_Y + 0.045, PL / 2 + 0.12]} visible={false}>
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.09, 0.34]} />
            <meshStandardMaterial color="#e5e9ee" metalness={0.3} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.047, -0.08]}>
            <boxGeometry args={[0.16, 0.004, 0.08]} />
            <meshStandardMaterial color="#1f2937" roughness={0.2} />
          </mesh>
          <mesh position={[0.08, 0.048, 0.1]}>
            <sphereGeometry args={[0.014, 16, 16]} />
            <meshStandardMaterial ref={ledMat} color="#10b981" emissive="#10b981" emissiveIntensity={0} />
          </mesh>
        </group>
      </group>
    </>
  )
}

/* ---------- widget con texto de etapa ---------- */
export default function SolarBuild3D() {
  const [page, setPage] = useState(0)

  useEffect(() => {
    let raf = 0
    const read = () => { raf = 0; setPage(getPage()) }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read) }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const placed = Math.min(60, Math.floor(st(page, ...S.cells) * 60))
  const done = page >= S.done[0]
  const label =
    done ? '¡Sistema instalado!'
    : page >= S.cable[0] ? 'Conectando inversor'
    : page >= S.glass[0] ? 'Vidrio y abrazaderas'
    : page >= S.cells[0] ? `Celdas ${placed}/60`
    : page >= S.frame[0] ? 'Montando marco'
    : 'Instalando rieles'

  return (
    <div aria-hidden className="pointer-events-none fixed bottom-[84px] left-2 z-[55] md:bottom-6 md:left-6">
      <div className="overflow-hidden rounded-xl border border-white/60 bg-gradient-to-b from-sky-100/90 to-white/90 shadow-lg shadow-slate-900/15 backdrop-blur-md md:rounded-2xl md:shadow-xl">
        <div className="h-[80px] w-[110px] md:h-[200px] md:w-[270px]">
          <Canvas
            shadows
            dpr={[1, 2]}
            gl={{ alpha: true, antialias: true }}
            camera={{ position: [0, 2.6, 2.7], fov: 34 }}
            onCreated={({ camera }) => camera.lookAt(0, -0.1, 0.1)}
          >
            <Scene />
          </Canvas>
        </div>
        <div className="px-2 pb-1.5 md:px-3 md:pb-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className={`truncate text-[9px] font-bold md:text-[11px] ${done ? 'text-emerald-600' : 'text-[#0B3A63]'}`}>{label}</span>
            <span className="hidden text-[10px] tabular-nums text-slate-400 md:inline">{Math.round(page * 100)}%</span>
          </div>
          <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-slate-200 md:h-1">
            <div
              className={`h-full rounded-full ${done ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#FDBA2D] to-[#FF6200]'}`}
              style={{ width: `${page * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}