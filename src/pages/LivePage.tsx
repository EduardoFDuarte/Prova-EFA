import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Registration, Poule, Bout, Category } from '../types/database'
import { categoryLabel, computePouleStandings } from '../utils/poules'

interface PouleWithData {
  poule: Poule
  memberships: (Registration & { position: number })[]
  bouts: Bout[]
}

interface ElimMatch {
  id: string; category: string; round: number; match_number: number
  athlete_a_id: string | null; athlete_b_id: string | null
  score_a: number | null; score_b: number | null; completed: boolean; winner_id: string | null
}

type LiveTab = Category | 'elim'

export default function LivePage() {
  const [poulesData, setPoulesData] = useState<PouleWithData[]>([])
  const [elim, setElim] = useState<ElimMatch[]>([])
  const [activeTab, setActiveTab] = useState<LiveTab>('benjamins_individual')
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [eventId, setEventId] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    const { data: ev } = await supabase
      .from('events')
      .select('id')
      .in('status', ['open', 'running'])
      .limit(1)
      .maybeSingle()

    if (!ev) return
    setEventId(ev.id)

    const { data: poules } = await supabase
      .from('poules')
      .select('*')
      .eq('event_id', ev.id)
      .order('category').order('poule_number')

    if (poules && poules.length > 0) {
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
        }))
        return { poule: poule as Poule, memberships: members, bouts: (bouts ?? []).filter((b) => b.poule_id === poule.id) as Bout[] }
      })
      setPoulesData(result)
    }

    const { data: elimData } = await supabase
      .from('elimination_matches')
      .select('*')
      .eq('event_id', ev.id)
      .order('category').order('round', { ascending: false }).order('match_number')
    setElim((elimData as ElimMatch[]) ?? [])
    setLastUpdate(new Date())
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Supabase Realtime subscriptions
  useEffect(() => {
    if (!eventId) return

    const channel = supabase
      .channel('live-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bouts' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'elimination_matches' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poules' }, fetchAll)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId, fetchAll])

  const categories: Category[] = ['benjamins_individual', 'benjamins_teams', 'infantis_individual', 'infantis_teams']
  const hasElim = elim.length > 0
  const allAthletes = poulesData.flatMap((pd) => pd.memberships)

  const getAthleteName = (id: string | null) => {
    if (!id) return 'BYE'
    const m = allAthletes.find((a) => a.id === id)
    return m ? m.athlete_name : id.slice(0, 8) + '…'
  }

  const tabs: { key: LiveTab; label: string }[] = [
    ...categories.map((c) => ({ key: c as LiveTab, label: categoryLabel(c).replace(' ', ' ') })),
    ...(hasElim ? [{ key: 'elim' as LiveTab, label: '🏆 Elim.' }] : []),
  ]

  return (
    <div className="max-w-2xl mx-auto px-2 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-lg font-black text-efa-blue flex items-center gap-2">
            <span className="live-pulse" /> Resultados ao Vivo
          </h1>
          <p className="text-xs text-gray-400">
            Atualizado: {lastUpdate.toLocaleTimeString('pt-PT')}
          </p>
        </div>
        <button onClick={fetchAll} className="text-sm text-efa-blue hover:text-efa-gold font-medium">
          ↻
        </button>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1 min-w-max">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === key
                  ? 'bg-efa-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab !== 'elim' ? (
        <PoulesView
          category={activeTab as Category}
          poulesData={poulesData.filter((pd) => pd.poule.category === activeTab)}
        />
      ) : (
        <ElimView elim={elim} getAthleteName={getAthleteName} />
      )}

      {poulesData.length === 0 && (
        <div className="text-center py-16 text-gray-300">
          <p className="text-5xl mb-3">⚔️</p>
          <p className="font-semibold text-gray-400">A prova ainda não começou</p>
          <p className="text-xs mt-1">Os resultados aparecerão aqui em tempo real.</p>
        </div>
      )}
    </div>
  )
}

// ─── Poules View ──────────────────────────────────────────────────────────────

function PoulesView({ poulesData }: { category: Category; poulesData: PouleWithData[] }) {
  if (poulesData.length === 0) {
    return (
      <div className="text-center py-10 text-gray-300">
        <p className="text-3xl mb-2">📋</p>
        <p className="text-sm text-gray-400">Sem poules para este escalão.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {poulesData.map((pd) => {
        const membersAsRegs = pd.memberships.map((m) => ({
          registration_id: m.id,
          registration: m,
        }))
        const standings = computePouleStandings(membersAsRegs, pd.bouts)
        const completed = pd.bouts.filter((b) => b.completed).length
        const total = pd.bouts.length

        return (
          <div key={pd.poule.id} className="card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-efa-blue">
                Poule {pd.poule.poule_number}
                {pd.poule.track && (
                  <span className="ml-2 badge bg-efa-blue text-white text-xs">Pista {pd.poule.track}</span>
                )}
              </h3>
              <span className="text-xs text-gray-400">{completed}/{total} combates</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-efa-gold h-1.5 rounded-full transition-all"
                style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
              />
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b">
                  <th className="text-left py-1 font-medium">#</th>
                  <th className="text-left py-1 font-medium">Atleta</th>
                  <th className="py-1 text-center font-medium">V/M</th>
                  <th className="py-1 text-center font-medium">TD</th>
                  <th className="py-1 text-center font-medium">TR</th>
                  <th className="py-1 text-center font-medium">Ind.</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <tr
                    key={s.registrationId}
                    className={`border-b border-gray-50 ${i === 0 ? 'bg-efa-gold/5' : ''}`}
                  >
                    <td className="py-2 pr-2">
                      {i === 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-efa-gold text-white text-xs font-bold">1</span>
                      ) : (
                        <span className="text-gray-400 text-xs pl-1">{i + 1}</span>
                      )}
                    </td>
                    <td className="py-2">
                      <p className={`font-medium text-sm ${i === 0 ? 'text-efa-blue' : ''}`}>{s.athleteName}</p>
                      <p className="text-xs text-gray-400">{s.clubName}</p>
                    </td>
                    <td className="text-center py-2 font-semibold text-sm">{s.victories}/{s.matchesPlayed}</td>
                    <td className="text-center py-2 text-sm">{s.touchesScored}</td>
                    <td className="text-center py-2 text-sm">{s.touchesReceived}</td>
                    <td className={`text-center py-2 font-semibold text-sm ${s.indicator > 0 ? 'text-green-600' : s.indicator < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {s.indicator > 0 ? '+' : ''}{s.indicator}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Recent bouts */}
            {pd.bouts.filter((b) => b.completed).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-gray-400 font-medium">Últimos resultados</p>
                {pd.bouts
                  .filter((b) => b.completed)
                  .slice(-3)
                  .map((bout) => {
                    const a = pd.memberships.find((m) => m.id === bout.athlete_a_id)
                    const b2 = pd.memberships.find((m) => m.id === bout.athlete_b_id)
                    if (!a || !b2) return null
                    const aWon = (bout.score_a ?? 0) > (bout.score_b ?? 0)
                    return (
                      <div key={bout.id} className="flex items-center gap-2 text-xs bg-gray-50 rounded px-2 py-1">
                        <span className={`flex-1 text-right ${aWon ? 'font-bold text-green-700' : 'text-gray-500'}`}>{a.athlete_name}</span>
                        <span className="font-mono font-bold text-gray-700">{bout.score_a} – {bout.score_b}</span>
                        <span className={`flex-1 ${!aWon ? 'font-bold text-green-700' : 'text-gray-500'}`}>{b2.athlete_name}</span>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Elimination View ─────────────────────────────────────────────────────────

function ElimView({ elim, getAthleteName }: { elim: ElimMatch[]; getAthleteName: (id: string | null) => string }) {
  const cats = [...new Set(elim.map((m) => m.category))]

  return (
    <div className="space-y-6">
      {cats.map((cat) => {
        const matches = elim.filter((m) => m.category === cat)
        const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => b - a)

        return (
          <div key={cat} className="space-y-3">
            <h2 className="font-bold text-efa-blue">{categoryLabel(cat)}</h2>
            {rounds.map((round) => (
              <div key={round} className="space-y-2">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                  {round === 1 ? 'Final' : round === 2 ? 'Meias-finais' : `Ronda ${round}`}
                </p>
                {matches.filter((m) => m.round === round).map((m) => {
                  const nameA = getAthleteName(m.athlete_a_id)
                  const nameB = getAthleteName(m.athlete_b_id)
                  const aWon = m.winner_id === m.athlete_a_id
                  const bWon = m.winner_id === m.athlete_b_id

                  return (
                    <div key={m.id} className={`card flex items-center gap-3 ${m.completed ? 'bg-green-50/50' : ''}`}>
                      <div className="flex-1 text-right">
                        <p className={`text-sm font-medium ${aWon ? 'text-green-700 font-bold' : ''}`}>{nameA}</p>
                      </div>
                      <div className="text-center shrink-0">
                        {m.completed ? (
                          <span className="font-mono font-bold text-base">{m.score_a} – {m.score_b}</span>
                        ) : (
                          <span className="text-gray-300 text-sm">vs</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${bWon ? 'text-green-700 font-bold' : ''}`}>{nameB}</p>
                      </div>
                      {m.completed && (
                        <span className="text-green-500 shrink-0">✓</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )
      })}

      {elim.length === 0 && (
        <div className="text-center py-10 text-gray-300">
          <p className="text-3xl mb-2">🏆</p>
          <p className="text-sm text-gray-400">Eliminação direta ainda não disponível.</p>
        </div>
      )}
    </div>
  )
}
