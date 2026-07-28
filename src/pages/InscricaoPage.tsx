import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CATEGORY_PRICES, categoryLabel } from '../utils/poules'
import type { Category, Event } from '../types/database'

interface AthleteEntry {
  name: string
  birthYear: string
  category: Category
  isFederated: boolean
  hasInsurance: boolean
}

const CURRENT_YEAR = new Date().getFullYear()

const categoryOptions: { value: Category; label: string; ages: string; price: number }[] = [
  { value: 'benjamins_individual', label: 'Benjamins Individual', ages: '5–7 anos', price: 6 },
  { value: 'benjamins_teams', label: 'Benjamins Equipas', ages: '5–7 anos', price: 9 },
  { value: 'infantis_individual', label: 'Infantis Individual', ages: '10–12 anos', price: 6 },
  { value: 'infantis_teams', label: 'Infantis Equipas', ages: '10–12 anos', price: 9 },
]

const emptyAthlete = (): AthleteEntry => ({
  name: '',
  birthYear: '',
  category: 'benjamins_individual',
  isFederated: false,
  hasInsurance: false,
})

export default function InscricaoPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [openEvents, setOpenEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [clubName, setClubName] = useState('')
  const [athletes, setAthletes] = useState<AthleteEntry[]>([emptyAthlete()])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .eq('status', 'open')
      .order('date', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setOpenEvents(data as Event[])
          setSelectedEventId(data[0].id)
        }
      })
  }, [])

  const total = useMemo(
    () => athletes.reduce((sum, a) => sum + CATEGORY_PRICES[a.category], 0),
    [athletes]
  )

  const updateAthlete = (idx: number, patch: Partial<AthleteEntry>) =>
    setAthletes((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)))

  const removeAthlete = (idx: number) =>
    setAthletes((prev) => prev.filter((_, i) => i !== idx))

  const addAthlete = () => setAthletes((prev) => [...prev, emptyAthlete()])

  const validate = (): string | null => {
    if (!selectedEventId) return 'Selecione um evento.'
    if (!clubName.trim()) return 'Insira o nome do clube.'
    for (let i = 0; i < athletes.length; i++) {
      const a = athletes[i]
      if (!a.name.trim()) return `Atleta ${i + 1}: insira o nome.`
      const by = parseInt(a.birthYear)
      if (isNaN(by) || by < 1990 || by > CURRENT_YEAR) return `Atleta ${i + 1}: ano de nascimento inválido.`
      if (!a.isFederated) return `Atleta ${i + 1}: deve estar federado na FPE.`
      if (!a.hasInsurance) return `Atleta ${i + 1}: deve ter seguro desportivo válido.`
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const err = validate()
    if (err) { setError(err); return }

    if (!token) {
      setError('Token de acesso inválido. Contacte a organização para obter o link de inscrição.')
      return
    }

    setSubmitting(true)
    try {
      const rows = athletes.map((a) => ({
        event_id: selectedEventId,
        club_name: clubName.trim(),
        athlete_name: a.name.trim(),
        birth_year: parseInt(a.birthYear),
        category: a.category,
        is_federated: a.isFederated,
        has_insurance: a.hasInsurance,
        status: 'pending' as const,
        token,
      }))

      const { error: dbErr } = await supabase.from('registrations').insert(rows)
      if (dbErr) throw new Error(dbErr.message)

      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao submeter inscrição.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedEvent = openEvents.find((e) => e.id === selectedEventId)

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h2 className="text-2xl font-bold text-efa-blue">Inscrição submetida!</h2>
        <p className="text-gray-600 text-sm">
          A inscrição do clube <strong>{clubName}</strong> para <strong>{selectedEvent?.name}</strong> foi recebida e aguarda validação.
        </p>
        <div className="card mt-4 text-left space-y-2">
          <p className="text-sm font-semibold text-gray-700">Resumo:</p>
          {athletes.map((a, i) => (
            <div key={i} className="flex justify-between text-sm text-gray-600 border-b border-gray-100 pb-1">
              <span>{a.name} <span className="text-xs text-gray-400">({categoryLabel(a.category)})</span></span>
              <span className="font-medium">{CATEGORY_PRICES[a.category]}€</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-efa-blue pt-1">
            <span>Total</span>
            <span>{total}€</span>
          </div>
        </div>
        <button
          onClick={() => { setSubmitted(false); setAthletes([emptyAthlete()]); setClubName('') }}
          className="btn-outline mt-2"
        >
          Nova inscrição
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-black text-efa-blue">Portal dos Clubes</h1>
        <p className="text-gray-500 text-sm mt-1">Inscrição de atletas para o EFA Circuit</p>
      </div>

      {!token && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm text-amber-800">
          <strong>⚠️ Token não encontrado.</strong> Este portal requer um link com token fornecido pela organização.
          Contacte a Evolution Fencing Academy para obter o seu link personalizado.
        </div>
      )}

      {openEvents.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 text-center">
          Nenhum evento aberto para inscrições no momento.
        </div>
      )}

      {openEvents.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Seleção de evento */}
          <div className="card space-y-3 border-t-4 border-efa-blue">
            <h2 className="font-bold text-efa-blue">📅 Evento</h2>
            {openEvents.length === 1 ? (
              <div className="flex items-center justify-between bg-efa-blue/5 rounded-lg px-3 py-2">
                <div>
                  <p className="font-semibold text-efa-blue">{openEvents[0].name}</p>
                  <p className="text-xs text-gray-500">{new Date(openEvents[0].date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <span className="badge bg-green-50 text-green-700 font-semibold">Aberto</span>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="label">Selecione o evento *</label>
                <select className="input" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
                  {openEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} — {new Date(ev.date).toLocaleDateString('pt-PT')}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Clube */}
          <div className="card space-y-3">
            <h2 className="font-bold text-efa-blue">🏛️ Dados do Clube</h2>
            <div>
              <label className="label">Nome do Clube *</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Clube de Esgrima de Lisboa"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Atletas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-efa-blue">🤺 Atletas</h2>
              <button type="button" onClick={addAthlete} className="btn-outline text-sm py-1">
                + Adicionar atleta
              </button>
            </div>

            {athletes.map((athlete, idx) => (
              <div key={idx} className="card space-y-3 border-l-4 border-efa-gold">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-efa-blue">Atleta {idx + 1}</span>
                  {athletes.length > 1 && (
                    <button type="button" onClick={() => removeAthlete(idx)} className="text-red-400 hover:text-red-600 text-xs font-medium">
                      Remover
                    </button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Nome completo *</label>
                    <input type="text" className="input" placeholder="Nome do atleta" value={athlete.name} onChange={(e) => updateAthlete(idx, { name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Ano de nascimento *</label>
                    <input type="number" className="input" placeholder={`Ex: ${CURRENT_YEAR - 8}`} value={athlete.birthYear} min={1990} max={CURRENT_YEAR} onChange={(e) => updateAthlete(idx, { birthYear: e.target.value })} required />
                  </div>
                </div>

                <div>
                  <label className="label">Escalão / Categoria *</label>
                  <select className="input" value={athlete.category} onChange={(e) => updateAthlete(idx, { category: e.target.value as Category })}>
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} ({opt.ages}) — {opt.price}€
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input type="checkbox" className="w-4 h-4 accent-efa-blue" checked={athlete.isFederated} onChange={(e) => updateAthlete(idx, { isFederated: e.target.checked })} />
                    <span>Federado na <strong>Federação Portuguesa de Esgrima (FPE)</strong> <span className="text-red-500">*</span></span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input type="checkbox" className="w-4 h-4 accent-efa-blue" checked={athlete.hasInsurance} onChange={(e) => updateAthlete(idx, { hasInsurance: e.target.checked })} />
                    <span>Possui <strong>seguro desportivo válido</strong> <span className="text-red-500">*</span></span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <span className="badge bg-efa-gold/10 text-efa-gold border border-efa-gold/30 font-semibold">{CATEGORY_PRICES[athlete.category]}€</span>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo */}
          <div className="card bg-efa-blue/5 border-efa-blue/20 space-y-2">
            <h3 className="font-bold text-efa-blue text-sm">📊 Resumo da Inscrição</h3>
            {selectedEvent && <p className="text-xs text-gray-500">Evento: <strong>{selectedEvent.name}</strong></p>}
            {athletes.map((a, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-700">
                <span>{a.name || `Atleta ${i + 1}`} — {categoryLabel(a.category)}</span>
                <span>{CATEGORY_PRICES[a.category]}€</span>
              </div>
            ))}
            <div className="border-t border-efa-blue/20 pt-2 flex justify-between font-bold text-efa-blue">
              <span>Total a pagar</span>
              <span>{total}€</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">⚠️ {error}</div>
          )}

          <button type="submit" className="btn-primary w-full py-3 text-base" disabled={submitting || !token}>
            {submitting ? 'A submeter...' : 'Submeter inscrição'}
          </button>

          <p className="text-xs text-center text-gray-400">
            As inscrições ficam pendentes até validação pela organização.
          </p>
        </form>
      )}
    </div>
  )
}
