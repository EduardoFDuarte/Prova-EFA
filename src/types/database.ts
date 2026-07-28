export type Category =
  | 'benjamins_individual'
  | 'benjamins_teams'
  | 'infantis_individual'
  | 'infantis_teams'

export type RegistrationStatus = 'pending' | 'approved' | 'rejected'

export interface Database {
  public: {
    Tables: {
      events: {
        Row: Event
        Insert: Omit<Event, 'id' | 'created_at'>
        Update: Partial<Omit<Event, 'id'>>
      }
      registrations: {
        Row: Registration
        Insert: Omit<Registration, 'id' | 'created_at'>
        Update: Partial<Omit<Registration, 'id'>>
      }
      poules: {
        Row: Poule
        Insert: Omit<Poule, 'id' | 'created_at'>
        Update: Partial<Omit<Poule, 'id'>>
      }
      poule_memberships: {
        Row: PouleMembership
        Insert: Omit<PouleMembership, 'id'>
        Update: Partial<Omit<PouleMembership, 'id'>>
      }
      bouts: {
        Row: Bout
        Insert: Omit<Bout, 'id' | 'created_at'>
        Update: Partial<Omit<Bout, 'id'>>
      }
      elimination_matches: {
        Row: EliminationMatch
        Insert: Omit<EliminationMatch, 'id' | 'created_at'>
        Update: Partial<Omit<EliminationMatch, 'id'>>
      }
    }
  }
}

export interface Event {
  id: string
  name: string
  date: string
  status: 'open' | 'running' | 'finished'
  created_at: string
}

export interface Registration {
  id: string
  event_id: string
  club_name: string
  athlete_name: string
  birth_year: number
  category: Category
  is_federated: boolean
  has_insurance: boolean
  status: RegistrationStatus
  token: string
  created_at: string
}

export interface Poule {
  id: string
  event_id: string
  category: Category
  poule_number: number
  track: string | null
  created_at: string
}

export interface PouleMembership {
  id: string
  poule_id: string
  registration_id: string
  position: number
}

export interface Bout {
  id: string
  poule_id: string
  athlete_a_id: string
  athlete_b_id: string
  score_a: number | null
  score_b: number | null
  completed: boolean
  created_at: string
}

export interface EliminationMatch {
  id: string
  event_id: string
  category: Category
  round: number
  match_number: number
  athlete_a_id: string | null
  athlete_b_id: string | null
  score_a: number | null
  score_b: number | null
  completed: boolean
  winner_id: string | null
  created_at: string
}
