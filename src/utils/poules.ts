import type { Registration, Bout } from '../types/database'

export interface PouleStanding {
  registrationId: string
  athleteName: string
  clubName: string
  victories: number
  matchesPlayed: number
  touchesScored: number
  touchesReceived: number
  indicator: number
}

export interface MembershipLike {
  registration_id: string
  registration: { athlete_name: string; club_name: string }
}

/** Compute standings for athletes in a single poule */
export function computePouleStandings(
  memberships: MembershipLike[],
  bouts: Bout[]
): PouleStanding[] {
  const standings: Record<string, PouleStanding> = {}

  for (const m of memberships) {
    standings[m.registration_id] = {
      registrationId: m.registration_id,
      athleteName: (m.registration as Registration).athlete_name,
      clubName: (m.registration as Registration).club_name,
      victories: 0,
      matchesPlayed: 0,
      touchesScored: 0,
      touchesReceived: 0,
      indicator: 0,
    }
  }

  for (const bout of bouts) {
    if (!bout.completed || bout.score_a === null || bout.score_b === null) continue

    const a = standings[bout.athlete_a_id]
    const b = standings[bout.athlete_b_id]
    if (!a || !b) continue

    a.matchesPlayed++
    b.matchesPlayed++
    a.touchesScored += bout.score_a
    a.touchesReceived += bout.score_b
    b.touchesScored += bout.score_b
    b.touchesReceived += bout.score_a

    if (bout.score_a > bout.score_b) a.victories++
    else if (bout.score_b > bout.score_a) b.victories++
  }

  for (const s of Object.values(standings)) {
    s.indicator = s.touchesScored - s.touchesReceived
  }

  return Object.values(standings).sort((a, b) => {
    if (b.victories !== a.victories) return b.victories - a.victories
    if (b.indicator !== a.indicator) return b.indicator - a.indicator
    return b.touchesScored - a.touchesScored
  })
}

/**
 * Generate all bout pairs for a round-robin poule (each pair plays twice = 2 rounds).
 * Returns pairs as [indexA, indexB].
 */
export function generateBoutPairs(athleteIds: string[]): [string, string][] {
  const pairs: [string, string][] = []
  for (let i = 0; i < athleteIds.length; i++) {
    for (let j = i + 1; j < athleteIds.length; j++) {
      // Two rounds
      pairs.push([athleteIds[i], athleteIds[j]])
      pairs.push([athleteIds[j], athleteIds[i]])
    }
  }
  return pairs
}

/**
 * Distribute athletes into poules of 5, separating same-club athletes when possible.
 * Returns array of groups (each group is an array of registration ids).
 */
export function distributeIntoPoules(
  registrations: Registration[],
  pouleSize = 5
): string[][] {
  const n = registrations.length
  if (n === 0) return []

  const numPoules = Math.ceil(n / pouleSize)
  const poules: string[][] = Array.from({ length: numPoules }, () => [])

  // Sort by club to spread them
  const sorted = [...registrations].sort((a, b) =>
    a.club_name.localeCompare(b.club_name)
  )

  // Serpentine distribution: fill poules in alternating direction
  let direction = 1
  let pouleIdx = 0

  for (const reg of sorted) {
    poules[pouleIdx].push(reg.id)
    pouleIdx += direction
    if (pouleIdx >= numPoules) {
      pouleIdx = numPoules - 1
      direction = -1
    } else if (pouleIdx < 0) {
      pouleIdx = 0
      direction = 1
    }
  }

  return poules
}

/** Build a single-elimination bracket seeded by poule rankings */
export function buildEliminationBracket(
  seededAthleteIds: string[]
): { round: number; matchNumber: number; aIndex: number; bIndex: number }[] {
  const n = seededAthleteIds.length
  // Find next power of 2
  let size = 1
  while (size < n) size *= 2

  const rounds: { round: number; matchNumber: number; aIndex: number; bIndex: number }[] = []
  const numRounds = Math.log2(size)

  // Classic seeding: 1 vs last, 2 vs second-to-last, etc.
  const seeding = classicSeeding(size)
  let matchNum = 0
  for (let i = 0; i < seeding.length; i += 2) {
    rounds.push({
      round: numRounds,
      matchNumber: matchNum++,
      aIndex: seeding[i] - 1,
      bIndex: seeding[i + 1] - 1,
    })
  }
  return rounds
}

function classicSeeding(size: number): number[] {
  if (size === 1) return [1]
  const half = size / 2
  const prev = classicSeeding(half)
  const result: number[] = []
  for (const s of prev) {
    result.push(s, size + 1 - s)
  }
  return result
}

export function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    benjamins_individual: 'Benjamins Individual',
    benjamins_teams: 'Benjamins Equipas',
    infantis_individual: 'Infantis Individual',
    infantis_teams: 'Infantis Equipas',
  }
  return map[cat] ?? cat
}

export const CATEGORY_PRICES: Record<string, number> = {
  benjamins_individual: 6,
  benjamins_teams: 9,
  infantis_individual: 6,
  infantis_teams: 9,
}

export const CATEGORY_TOUCH_LIMIT: Record<string, number> = {
  benjamins_individual: 3,
  benjamins_teams: 18,
  infantis_individual: 4,
  infantis_teams: 27,
}
