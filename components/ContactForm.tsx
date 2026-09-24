"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [region, setRegion] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    // Insertar el mensaje en la tabla contact_messages de Supabase
    const { error } = await supabase.from('contact_messages').insert([
      {
        name,
        phone,
        email,
        region,
        subject,
        message,
      }
    ])

    setLoading(false)

    if (error) {
      alert('Error al enviar el mensaje: ' + error.message)
    } else {
      setSuccess(true)
      setName('')
      setPhone('')
      setEmail('')
      setRegion('')
      setSubject('')
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium">
          ¡Mensaje enviado con éxito! Un especialista en energía solar se pondrá en contacto contigo muy pronto.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Tu nombre completo" 
            required 
            className="w-full border border-slate-300 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:border-orange-500" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono</label>
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="+56 9 1234 5678" 
            required 
            className="w-full border border-slate-300 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:border-orange-500" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="correo@empresa.cl" 
            required 
            className="w-full border border-slate-300 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:border-orange-500" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Desde donde nos escribes</label>
          <select 
            value={region} 
            onChange={(e) => setRegion(e.target.value)} 
            required
            className="w-full border border-slate-300 rounded-xl p-3.5 text-slate-800 bg-white focus:outline-none focus:border-orange-500"
          >
            <option value="">—Por favor, elige una opción—</option>
            <option value="Arica y Parinacota">Región de Arica y Parinacota</option>
            <option value="Tarapacá">Región de Tarapacá</option>
            <option value="Antofagasta">Región de Antofagasta</option>
            <option value="Atacama">Región de Atacama</option>
            <option value="Coquimbo">Región de Coquimbo</option>
            <option value="Valparaíso">Región de Valparaíso</option>
            <option value="Metropolitana">Región Metropolitana</option>
            <option value="O’Higgins">Región de O’Higgins</option>
            <option value="Maule">Región del Maule</option>
            <option value="Ñuble">Región del Ñuble</option>
            <option value="Biobío">Región del Biobío</option>
            <option value="La Araucanía">Región de La Araucanía</option>
            <option value="Los Ríos">Región de Los Ríos</option>
            <option value="Los Lagos">Región de Los Lagos</option>
            <option value="Aysén">Región de Aysén</option>
            <option value="Magallanes">Región de Magallanes</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Motivo de contacto</label>
        <input 
          type="text" 
          value={subject} 
          onChange={(e) => setSubject(e.target.value)} 
          placeholder="Ej: Cotización kit solar industrial" 
          required
          className="w-full border border-slate-300 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:border-orange-500" 
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Mensaje (optional)</label>
        <textarea 
          rows={4} 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Cuéntanos sobre tu consumo eléctrico actual..." 
          className="w-full border border-slate-300 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:border-orange-500"
        ></textarea>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-600/20 cursor-pointer disabled:opacity-50"
      >
        {loading ? 'Enviando cotización...' : 'Enviar Mensaje de Cotización'}
      </button>
    </form>
  )
}