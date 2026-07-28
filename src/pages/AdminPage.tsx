import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Registration, Poule, Bout, Category, Event } from '../types/database'
import {
  categoryLabel,
  distributeIntoPoules,
  computePouleStandings,
  CATEGORY_TOUCH_LIMIT,
} from '../utils/poules'

type Tab = 'eventos' | 'inscricoes' | 'poules' | 'eliminacao'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'efa2025'

interface PouleWithData {
  poule: Poule
  memberships: (Registration & { position: number; membershipId: string })[]
  bouts: Bout[]
}

interface EventWithCount extends Event {
  registrationCount: number
}

// ─── Root page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [tab, setTab] = useState<Tab>('eventos')
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [poulesData, setPoulesData] = useState<PouleWithData[]>([])
  const [eventId, setEventId] = useState<string | null>(null)
  const [events, setEvents] = useState<EventWithCount[]>([])

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })
    if (!data) return

    const counts = await Promise.all(
      data.map(async (ev) => {
        const { count } = await supabase
          .from('registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', ev.id)
        return { ...ev, registrationCount: count ?? 0 } as EventWithCount
      })
    )
    setEvents(counts)

    // Auto-select first open/running event
    const active = counts.find((e) => e.status === 'open' || e.status === 'running')
    if (active && !eventId) setEventId(active.id)
  }, [eventId])

  const fetchRegistrations = useCallback(async () => {
    if (!eventId) return
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })
    if (data) setRegistrations(data as Registration[])
  }, [eventId])

  const fetchPoules = useCallback(async () => {
    if (!eventId) return
    const { data: poules } = await supabase
      .from('poules')
      .select('*')
      .eq('event_id', eventId)
      .order('category')
      .order('poule_number')

    if (!poules || poules.length === 0) { setPoulesData([]); return }

    const { data: memberships } = await supabase
      .from('poule_memberships')
      .select('*, registrations(*)')
      .in('poule_id', poules.map((p) => p.id))

    const { data: bouts } = await supabase
      .from('bouts')
      .select('*')
      .in('poule_id', poules.map((p) => p.id))

    const result: PouleWithData[] = poules.map((poule) => {
      const pm = (memberships ?? []).filter((m) => m.poule_id === poule.id)
      const members = pm.map((m) => ({
        ...(m.registrations as Registration),
        position: m.position as number,
        membershipId: m.id as string,
      }))
      const pb = (bouts ?? []).filter((b) => b.poule_id === poule.id)
      return { poule: poule as Poule, memberships: members, bouts: pb as Bout[] }
    })
    setPoulesData(result)
  }, [eventId])

  useEffect(() => { if (authed) fetchEvents() }, [authed, fetchEvents])
  useEffect(() => {
    if (eventId) { fetchRegistrations(); fetchPoules() }
  }, [eventId, fetchRegistrations, fetchPoules])

  if (!authed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="card max-w-sm w-full space-y-4">
          <h1 className="text-xl font-black text-efa-blue text-center">🔐 Painel de Administrador</h1>
          <p className="text-sm text-gray-500 text-center">Área restrita à organização do EFA Circuit</p>
          <div>
            <label className="label">Palavra-passe</label>
            <input
              type="password"
              className="input"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && pw === ADMIN_PASSWORD) setAuthed(true) }}
              placeholder="••••••••"
            />
          </div>
          <button className="btn-primary w-full" onClick={() => { if (pw === ADMIN_PASSWORD) setAuthed(true) }}>
            Entrar
          </button>
        </div>
      </div>
    )
  }

  const selectedEvent = events.find((e) => e.id === eventId)

  const handleGeneratePoules = async () => {
    await generatePoules(registrations, eventId!)
    await fetchPoules()
    setTab('poules')
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'eventos', label: '📅 Eventos' },
    { key: 'inscricoes', label: '📋 Inscrições' },
    { key: 'poules', label: '⚔️ Poules' },
    { key: 'eliminacao', label: '🏆 Eliminação' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-efa-blue">⚙️ Painel de Administrador</h1>
        <button className="text-xs text-gray-400 hover:text-red-500" onClick={() => setAuthed(false)}>Sair</button>
      </div>

      {/* Evento ativo */}
      {selectedEvent && tab !== 'eventos' && (
        <div className="flex items-center gap-3 bg-efa-blue/5 border border-efa-blue/20 rounded-xl px-4 py-2">
          <span className="text-xs text-gray-500">Evento ativo:</span>
          <span className="font-semibold text-efa-blue text-sm">{selectedEvent.name}</span>
          <span className="text-xs text-gray-400">{new Date(selectedEvent.date).toLocaleDateString('pt-PT')}</span>
          <span className={`badge ml-auto ${selectedEvent.status === 'open' ? 'bg-green-50 text-green-700' : selectedEvent.status === 'running' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'}`}>
            {selectedEvent.status === 'open' ? 'Aberto' : selectedEvent.status === 'running' ? 'A decorrer' : 'Terminado'}
          </span>
          <button className="text-xs text-efa-blue underline" onClick={() => setTab('eventos')}>Mudar</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap px-2 ${
              tab === key ? 'bg-white text-efa-blue shadow' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'eventos' && (
        <EventosTab
          events={events}
          selectedEventId={eventId}
          onSelect={(id) => { setEventId(id); setTab('inscricoes') }}
          onRefresh={fetchEvents}
          onCreated={(id) => { fetchEvents(); setEventId(id); setTab('inscricoes') }}
        />
      )}
      {tab === 'inscricoes' && (
        <InscricoesTab
          registrations={registrations}
          eventId={eventId}
          onRefresh={fetchRegistrations}
          onGeneratePoules={handleGeneratePoules}
        />
      )}
      {tab === 'poules' && (
        <PoulesTab poulesData={poulesData} onRefresh={fetchPoules} onGoToElimination={() => setTab('eliminacao')} />
      )}
      {tab === 'eliminacao' && (
        <EliminacaoTab eventId={eventId} poulesData={poulesData} />
      )}
    </div>
  )
}

// ─── Eventos Tab ──────────────────────────────────────────────────────────────

function EventosTab({
  events, selectedEventId, onSelect, onRefresh, onCreated,
}: {
  events: EventWithCount[]
  selectedEventId: string | null
  onSelect: (id: string) => void
  onRefresh: () => void
  onCreated: (id: string) => void
}) {
  const [showCreate, setShowCreate] = useState(false)

  const statusLabel: Record<string, string> = {
    open: 'Aberto',
    running: 'A decorrer',
    finished: 'Terminado',
  }
  const statusColor: Record<string, string> = {
    open: 'bg-green-50 text-green-700',
    running: 'bg-blue-50 text-blue-700',
    finished: 'bg-gray-50 text-gray-500',
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('events').update({ status }).eq('id', id)
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{events.length} evento(s) encontrado(s)</p>
        <div className="flex gap-2">
          <button className="btn-outline text-sm py-1" onClick={onRefresh}>↻ Atualizar</button>
          <button className="btn-gold text-sm py-1" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancelar' : '+ Novo evento'}
          </button>
        </div>
      </div>

      {showCreate && (
        <CreateEventPanel onCreated={(id) => { setShowCreate(false); onCreated(id) }} />
      )}

      {events.length === 0 && !showCreate && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">📅</p>
          <p className="text-sm">Nenhum evento criado ainda.</p>
        </div>
      )}

      <div className="space-y-3">
        {events.map((ev) => (
          <div key={ev.id} className={`card space-y-3 border-l-4 ${selectedEventId === ev.id ? 'border-efa-gold' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-efa-blue">{ev.name}</h3>
                <p className="text-xs text-gray-400">{new Date(ev.date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge font-semibold ${statusColor[ev.status]}`}>{statusLabel[ev.status]}</span>
                <span className="badge bg-efa-blue/10 text-efa-blue font-semibold">{ev.registrationCount} inscritos</span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                className={`text-sm px-3 py-1 rounded-lg font-semibold transition-colors ${selectedEventId === ev.id ? 'bg-efa-gold text-white' : 'btn-outline'}`}
                onClick={() => onSelect(ev.id)}
              >
                {selectedEventId === ev.id ? '✓ Selecionado' : 'Selecionar'}
              </button>
              {ev.status === 'open' && (
                <button onClick={() => updateStatus(ev.id, 'running')} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                  Iniciar prova
                </button>
              )}
              {ev.status === 'running' && (
                <button onClick={() => updateStatus(ev.id, 'finished')} className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600">
                  Terminar prova
                </button>
              )}
              {ev.status === 'finished' && (
                <button onClick={() => updateStatus(ev.id, 'open')} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                  Reabrir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Create Event ─────────────────────────────────────────────────────────────

function CreateEventPanel({ onCreated }: { onCreated: (id: string) => void }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  const create = async () => {
    if (!name.trim()) return
    setLoading(true)
    const { data } = await supabase
      .from('events')
      .insert({ name: name.trim(), date, status: 'open' })
      .select('id')
      .maybeSingle()
    if (data) onCreated(data.id)
    setLoading(false)
  }

  return (
    <div className="card border-amber-200 bg-amber-50 space-y-3">
      <h2 className="font-bold text-amber-800">🆕 Novo Evento</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Nome da prova</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="EFA Circuit #1" />
        </div>
        <div>
          <label className="label">Data</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <button className="btn-gold" onClick={create} disabled={loading}>
        {loading ? 'A criar...' : 'Criar evento'}
      </button>
    </div>
  )
}

// ─── Inscrições Tab ───────────────────────────────────────────────────────────

function InscricoesTab({
  registrations, eventId, onRefresh, onGeneratePoules,
}: {
  registrations: Registration[]
  eventId: string | null
  onRefresh: () => void
  onGeneratePoules: () => Promise<void>
}) {
  const [generating, setGenerating] = useState(false)
  const approved = registrations.filter((r) => r.status === 'approved')

  const byCategory = registrations.reduce<Record<string, Registration[]>>((acc, r) => {
    acc[r.category] = [...(acc[r.category] ?? []), r]
    return acc
  }, {})

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('registrations').update({ status }).eq('id', id)
    onRefresh()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-3 text-sm">
          <span className="text-gray-600">Total: <strong>{registrations.length}</strong></span>
          <span className="text-green-600">Aprovados: <strong>{approved.length}</strong></span>
          <span className="text-yellow-600">Pendentes: <strong>{registrations.filter(r => r.status === 'pending').length}</strong></span>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline text-sm py-1" onClick={onRefresh}>↻ Atualizar</button>
          {approved.length >= 2 && (
            <button
              className="btn-primary text-sm py-1"
              disabled={generating || !eventId}
              onClick={async () => { setGenerating(true); await onGeneratePoules(); setGenerating(false) }}
            >
              {generating ? 'A gerar...' : '⚔️ Gerar Poules'}
            </button>
          )}
        </div>
      </div>

      {Object.entries(byCategory).map(([cat, regs]) => (
        <div key={cat} className="space-y-2">
          <h3 className="font-bold text-efa-blue text-sm border-b pb-1">{categoryLabel(cat)} ({regs.length})</h3>
          {regs.map((r) => (
            <div key={r.id} className="card flex flex-wrap items-center gap-3 justify-between">
              <div>
                <p className="font-medium text-sm">{r.athlete_name}</p>
                <p className="text-xs text-gray-500">{r.club_name} · {r.birth_year}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  <span className={`badge ${r.is_federated ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>FPE {r.is_federated ? '✓' : '✗'}</span>
                  <span className={`badge ${r.has_insurance ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>Seguro {r.has_insurance ? '✓' : '✗'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge font-semibold ${r.status === 'approved' ? 'bg-green-50 text-green-700' : r.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {r.status === 'approved' ? 'Aprovado' : r.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                </span>
                {r.status !== 'approved' && (
                  <button onClick={() => updateStatus(r.id, 'approved')} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">✓</button>
                )}
                {r.status !== 'rejected' && (
                  <button onClick={() => updateStatus(r.id, 'rejected')} className="text-xs bg-red-400 text-white px-2 py-1 rounded hover:bg-red-600">✗</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      {registrations.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">Sem inscrições para este evento.</p>
        </div>
      )}
    </div>
  )
}

// ─── Poules Tab ───────────────────────────────────────────────────────────────

function PoulesTab({
  poulesData, onRefresh, onGoToElimination,
}: {
  poulesData: PouleWithData[]
  onRefresh: () => Promise<void>
  onGoToElimination: () => void
}) {
  const [boutScores, setBoutScores] = useState<Record<string, { a: string; b: string }>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const saveBout = async (bout: Bout, scoreA: number, scoreB: number) => {
    setSaving(bout.id)
    await supabase.from('bouts').update({ score_a: scoreA, score_b: scoreB, completed: true }).eq('id', bout.id)
    await onRefresh()
    setSaving(null)
  }

  const byCategory = poulesData.reduce<Record<string, PouleWithData[]>>((acc, pd) => {
    const cat = pd.poule.category
    acc[cat] = [...(acc[cat] ?? []), pd]
    return acc
  }, {})

  if (poulesData.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-3xl mb-2">⚔️</p>
        <p className="text-sm">Poules ainda não geradas. Aprove atletas e clique "Gerar Poules".</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <button className="btn-outline text-sm py-1" onClick={onRefresh}>↻ Atualizar</button>
        <button className="btn-gold text-sm" onClick={onGoToElimination}>🏆 Ver Eliminação →</button>
      </div>

      {Object.entries(byCategory).map(([cat, pds]) => (
        <div key={cat} className="space-y-4">
          <h2 className="text-base font-bold text-efa-blue border-b pb-1">
            {categoryLabel(cat)} · {CATEGORY_TOUCH_LIMIT[cat]} toques por combate
          </h2>
          {pds.map((pd) => {
            const membersAsRegistrations = pd.memberships.map((m) => ({
              registration_id: m.id,
              registration: m,
            }))
            const standings = computePouleStandings(membersAsRegistrations, pd.bouts)

            return (
              <div key={pd.poule.id} className="card space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-bold text-efa-blue">Poule {pd.poule.poule_number}</h3>
                  <TrackEditor pouleId={pd.poule.id} current={pd.poule.track} onSave={onRefresh} />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-gray-500">
                        <th className="text-left py-1">Atleta</th>
                        <th className="py-1 text-center">V/M</th>
                        <th className="py-1 text-center">TD</th>
                        <th className="py-1 text-center">TR</th>
                        <th className="py-1 text-center">Ind.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((s, i) => (
                        <tr key={s.registrationId} className={`border-b border-gray-50 ${i === 0 ? 'font-semibold text-efa-blue' : ''}`}>
                          <td className="py-1.5"><span className="text-gray-400 mr-1">{i + 1}.</span>{s.athleteName}<span className="text-gray-400 text-[10px] ml-1">({s.clubName})</span></td>
                          <td className="text-center">{s.victories}/{s.matchesPlayed}</td>
                          <td className="text-center">{s.touchesScored}</td>
                          <td className="text-center">{s.touchesReceived}</td>
                          <td className={`text-center ${s.indicator > 0 ? 'text-green-600' : s.indicator < 0 ? 'text-red-500' : ''}`}>{s.indicator > 0 ? '+' : ''}{s.indicator}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Combates</p>
                  {pd.bouts.map((bout) => {
                    const athleteA = pd.memberships.find((m) => m.id === bout.athlete_a_id)
                    const athleteB = pd.memberships.find((m) => m.id === bout.athlete_b_id)
                    if (!athleteA || !athleteB) return null
                    const score = boutScores[bout.id] ?? { a: bout.score_a?.toString() ?? '', b: bout.score_b?.toString() ?? '' }

                    return (
                      <div key={bout.id} className={`flex items-center gap-2 text-sm rounded-lg p-2 ${bout.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <span className="flex-1 text-right text-xs font-medium truncate">{athleteA.athlete_name}</span>
                        <input type="number" min={0} max={CATEGORY_TOUCH_LIMIT[cat]} className="w-12 text-center border rounded px-1 py-0.5 text-sm" value={score.a} disabled={bout.completed} onChange={(e) => setBoutScores((prev) => ({ ...prev, [bout.id]: { ...score, a: e.target.value } }))} />
                        <span className="text-gray-400 text-xs">vs</span>
                        <input type="number" min={0} max={CATEGORY_TOUCH_LIMIT[cat]} className="w-12 text-center border rounded px-1 py-0.5 text-sm" value={score.b} disabled={bout.completed} onChange={(e) => setBoutScores((prev) => ({ ...prev, [bout.id]: { ...score, b: e.target.value } }))} />
                        <span className="flex-1 text-xs font-medium truncate">{athleteB.athlete_name}</span>
                        {!bout.completed ? (
                          <button className="text-xs bg-efa-blue text-white px-2 py-1 rounded disabled:opacity-50" disabled={saving === bout.id}
                            onClick={() => { const sa = parseInt(score.a), sb = parseInt(score.b); if (!isNaN(sa) && !isNaN(sb)) saveBout(bout, sa, sb) }}>
                            {saving === bout.id ? '…' : '✓'}
                          </button>
                        ) : <span className="text-green-500 text-xs">✓</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function TrackEditor({ pouleId, current, onSave }: { pouleId: string; current: string | null; onSave: () => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(current ?? '')

  const save = async () => {
    await supabase.from('poules').update({ track: val || null }).eq('id', pouleId)
    setEditing(false)
    onSave()
  }

  if (!editing) return (
    <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-efa-blue underline">
      {current ? `Pista ${current}` : '+ Atribuir pista'}
    </button>
  )
  return (
    <span className="flex gap-1 items-center">
      <input className="border rounded px-1 py-0.5 text-xs w-16" value={val} onChange={(e) => setVal(e.target.value)} placeholder="Ex: A1" />
      <button onClick={save} className="text-xs text-green-600 font-bold">✓</button>
      <button onClick={() => setEditing(false)} className="text-xs text-red-400">✗</button>
    </span>
  )
}

// ─── Eliminação Tab ───────────────────────────────────────────────────────────

interface ElimMatch {
  id: string; event_id: string; category: string; round: number; match_number: number
  athlete_a_id: string | null; athlete_b_id: string | null
  score_a: number | null; score_b: number | null; completed: boolean; winner_id: string | null
}

function EliminacaoTab({ eventId, poulesData }: { eventId: string | null; poulesData: PouleWithData[] }) {
  const [elim, setElim] = useState<ElimMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)

  const fetchElim = useCallback(async () => {
    if (!eventId) return
    const { data } = await supabase.from('elimination_matches').select('*')
      .eq('event_id', eventId).order('category').order('round', { ascending: false }).order('match_number')
    setElim((data as ElimMatch[]) ?? [])
  }, [eventId])

  useEffect(() => { fetchElim() }, [fetchElim])

  const generateBracket = async (category: Category) => {
    if (!eventId) return
    setLoading(true)
    const catPoules = poulesData.filter((pd) => pd.poule.category === category)
    if (catPoules.length === 0) { setLoading(false); return }

    const allStandings = catPoules.flatMap((pd) =>
      computePouleStandings(
        pd.memberships.map((m) => ({ registration_id: m.id, registration: m })),
        pd.bouts
      )
    ).sort((a, b) => {
      const ra = a.matchesPlayed ? a.victories / a.matchesPlayed : 0
      const rb = b.matchesPlayed ? b.victories / b.matchesPlayed : 0
      if (rb !== ra) return rb - ra
      if (b.indicator !== a.indicator) return b.indicator - a.indicator
      return b.touchesScored - a.touchesScored
    })

    const n = allStandings.length
    let size = 1
    while (size < n) size *= 2
    const numRounds = Math.log2(size)
    const pairs = classicSeedPairs(size)

    const rows = pairs.map(([ai, bi], matchNum) => ({
      event_id: eventId, category, round: numRounds, match_number: matchNum,
      athlete_a_id: allStandings[ai - 1]?.registrationId ?? null,
      athlete_b_id: allStandings[bi - 1]?.registrationId ?? null,
      score_a: null, score_b: null, completed: false, winner_id: null,
    }))

    await supabase.from('elimination_matches').delete().eq('event_id', eventId).eq('category', category)
    await supabase.from('elimination_matches').insert(rows)
    await fetchElim()
    setLoading(false)
  }

  const saveScore = async (m: ElimMatch, sa: number, sb: number) => {
    setSaving(m.id)
    const winnerId = sa > sb ? m.athlete_a_id : m.athlete_b_id
    await supabase.from('elimination_matches').update({ score_a: sa, score_b: sb, completed: true, winner_id: winnerId }).eq('id', m.id)
    await fetchElim()
    setSaving(null)
  }

  const getAthleteName = (id: string | null) => {
    if (!id) return 'BYE'
    for (const pd of poulesData) {
      const m = pd.memberships.find((m) => m.id === id)
      if (m) return m.athlete_name
    }
    return id.slice(0, 8) + '…'
  }

  const indivCats: Category[] = ['benjamins_individual', 'infantis_individual']

  return (
    <div className="space-y-6">
      {indivCats.map((cat) => {
        const matches = elim.filter((m) => m.category === cat)
        const hasPoules = poulesData.some((pd) => pd.poule.category === cat)

        return (
          <div key={cat} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-efa-blue">{categoryLabel(cat)}</h2>
              {hasPoules && (
                <button className="btn-gold text-sm py-1" disabled={loading} onClick={() => generateBracket(cat)}>
                  {matches.length > 0 ? '↺ Regenerar' : '⚡ Gerar Quadro'}
                </button>
              )}
            </div>
            {matches.length === 0 ? (
              <p className="text-sm text-gray-400">Quadro não gerado. Complete as poules e clique "Gerar Quadro".</p>
            ) : (
              <div className="space-y-2">
                {matches.map((m) => (
                  <MatchRow key={m.id} match={m} nameA={getAthleteName(m.athlete_a_id)} nameB={getAthleteName(m.athlete_b_id)}
                    saving={saving === m.id} touchLimit={10} onSave={(sa, sb) => saveScore(m, sa, sb)} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function MatchRow({ match, nameA, nameB, saving, onSave, touchLimit }: {
  match: ElimMatch; nameA: string; nameB: string; saving: boolean
  onSave: (a: number, b: number) => void; touchLimit: number
}) {
  const [sa, setSa] = useState(match.score_a !== null ? String(match.score_a) : '')
  const [sb, setSb] = useState(match.score_b !== null ? String(match.score_b) : '')

  return (
    <div className={`card flex items-center gap-2 text-sm ${match.completed ? 'bg-green-50' : ''}`}>
      <span className="text-xs text-gray-400 w-16 shrink-0">R{match.round} M{match.match_number + 1}</span>
      <span className={`flex-1 text-right text-xs font-medium truncate ${match.winner_id === match.athlete_a_id ? 'text-green-700 font-bold' : ''}`}>{nameA}</span>
      <input type="number" min={0} max={touchLimit} className="w-12 text-center border rounded px-1 py-0.5 text-sm" value={sa} onChange={(e) => setSa(e.target.value)} disabled={match.completed} />
      <span className="text-gray-400 text-xs">vs</span>
      <input type="number" min={0} max={touchLimit} className="w-12 text-center border rounded px-1 py-0.5 text-sm" value={sb} onChange={(e) => setSb(e.target.value)} disabled={match.completed} />
      <span className={`flex-1 text-xs font-medium truncate ${match.winner_id === match.athlete_b_id ? 'text-green-700 font-bold' : ''}`}>{nameB}</span>
      {!match.completed ? (
        <button className="text-xs bg-efa-blue text-white px-2 py-1 rounded disabled:opacity-50" disabled={saving}
          onClick={() => { const a = parseInt(sa), b = parseInt(sb); if (!isNaN(a) && !isNaN(b)) onSave(a, b) }}>
          {saving ? '…' : '✓'}
        </button>
      ) : <span className="text-green-500">✓</span>}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function classicSeedPairs(size: number): [number, number][] {
  function seeds(n: number): number[] {
    if (n === 1) return [1]
    const prev = seeds(n / 2)
    return prev.flatMap((s) => [s, n + 1 - s])
  }
  const arr = seeds(size)
  const pairs: [number, number][] = []
  for (let i = 0; i < arr.length; i += 2) pairs.push([arr[i], arr[i + 1]])
  return pairs
}

async function generatePoules(registrations: Registration[], eventId: string) {
  const approved = registrations.filter((r) => r.status === 'approved')
  const byCategory = approved.reduce<Record<string, Registration[]>>((acc, r) => {
    acc[r.category] = [...(acc[r.category] ?? []), r]
    return acc
  }, {})

  await supabase.from('poules').delete().eq('event_id', eventId)

  for (const [category, regs] of Object.entries(byCategory)) {
    const groups = distributeIntoPoules(regs)
    for (let i = 0; i < groups.length; i++) {
      const { data: poule } = await supabase
        .from('poules').insert({ event_id: eventId, category, poule_number: i + 1, track: null })
        .select('id').maybeSingle()
      if (!poule) continue

      await supabase.from('poule_memberships').insert(
        groups[i].map((regId, pos) => ({ poule_id: poule.id, registration_id: regId, position: pos }))
      )

      const boutPairs = []
      const ids = groups[i]
      for (let a = 0; a < ids.length; a++) {
        for (let b = a + 1; b < ids.length; b++) {
          boutPairs.push({ poule_id: poule.id, athlete_a_id: ids[a], athlete_b_id: ids[b], score_a: null, score_b: null, completed: false })
          boutPairs.push({ poule_id: poule.id, athlete_a_id: ids[b], athlete_b_id: ids[a], score_a: null, score_b: null, completed: false })
        }
      }
      if (boutPairs.length > 0) await supabase.from('bouts').insert(boutPairs)
    }
  }
}
