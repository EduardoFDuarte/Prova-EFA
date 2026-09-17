import { Link } from 'react-router-dom'
import efaLogo from '../assets/efa_logo.jpeg'

const escaloes = [
  {
    name: 'Benjamins',
    age: '5–7 anos',
    icon: '⚔️',
    items: [
      'Individual: Poules de 4, 3 toques por combate, 2 voltas',
      'Equipas: 3 atletas, 18 toques no total',
      'Inscrição: 6€ individual · 9€ equipas',
    ],
  },
  {
    name: 'Benjamins A',
    age: '8–10 anos',
    icon: '🤺',
    items: [
      'Individual: Mesmo formato dos Benjamins',
      'Equipas: 3 atletas, 18 toques no total',
      'Inscrição: 6€ individual · 9€ equipas',
    ],
  },
  {
    name: 'Infantis',
    age: '10–12 anos',
    icon: '🏆',
    items: [
      'Individual: Poules de 4, 4 toques + eliminação direta a 10 toques',
      'Equipas: 3 atletas, 27 toques no total (podem ser mistas)',
      'Inscrição: 6€ individual · 9€ equipas',
    ],
  },
]

const regulamento = [
  { icon: '🪪', title: 'Federação', text: 'Todos os atletas devem estar federados na Federação Portuguesa de Esgrima (FPE).' },
  { icon: '🛡️', title: 'Seguro', text: 'Obrigatório possuir seguro desportivo válido para participar.' },
  { icon: '🤝', title: 'Fair Play', text: 'Respeito obrigatório por atletas, treinadores, árbitros e organização.' },
  { icon: '⏰', title: 'Pontualidade', text: 'Cumprir os horários estabelecidos. Atraso implica ausência do combate.' },
  { icon: '⚖️', title: 'Arbitragem', text: 'Assegurada por atletas experientes indicados pelos treinadores, supervisionados por elementos sénior.' },
  { icon: '🏅', title: 'Prémios', text: 'Medalhas, troféus, Prémio Fair Play e reconhecimento da evolução individual.' },
]

const sideLinks = [
  { label: 'Formação', href: '#filosofia' },
  { label: 'Escalões', href: '#escaloes' },
  { label: 'Regulamento', href: '#regulamento' },
  { label: 'Objetivos', href: '#objetivos' },
]

export default function HomePage() {
  return (
    <div className="bg-black text-white">
      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Dark gradient background with subtle texture */}
        <div className="absolute inset-0 bg-black" />
        {/* Gold diagonal lines texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 60px)',
          }}
        />

        {/* Center logo watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={efaLogo}
            alt=""
            className="w-[420px] h-[420px] object-cover rounded-full opacity-[0.07] blur-sm"
          />
        </div>

        {/* Left content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex items-center gap-12">
          <div className="flex-1 space-y-7 max-w-xl">
            <div className="flex items-center gap-3">
              <div className="h-0.5 w-12 bg-efa-gold" />
              <span className="text-efa-gold text-xs font-bold tracking-[0.3em] uppercase">Training for Life</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-black leading-[1.05] tracking-tight">
              EVOLUTION<br />
              FENCING<br />
              ACADEMY<br />
              <span className="text-efa-gold">CIRCUIT</span>
            </h1>

            <p className="text-gray-400 text-sm tracking-[0.2em] uppercase font-medium">
              Competir · Aprender · Evoluir
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/live"
                className="flex items-center gap-2 border border-efa-gold text-efa-gold px-7 py-3 text-xs font-bold tracking-widest uppercase hover:bg-efa-gold hover:text-black transition-all"
              >
                <span className="live-pulse" />
                Ver ao Vivo
              </Link>
              <Link
                to="/inscricao"
                className="border border-white/30 text-white/70 px-7 py-3 text-xs font-bold tracking-widest uppercase hover:border-white hover:text-white transition-all"
              >
                Inscrever Clube
              </Link>
            </div>
          </div>

          {/* Right: logo + side navigation */}
          <div className="hidden lg:flex flex-col items-center gap-8">
            <img
              src={efaLogo}
              alt="Evolution Fencing Academy"
              className="w-56 h-56 rounded-full object-cover border-2 border-efa-gold/40 shadow-[0_0_60px_rgba(201,168,76,0.15)]"
            />
            <div className="space-y-2 text-right">
              <p className="text-efa-gold/50 text-[10px] tracking-[0.3em] uppercase mb-3">Mais do que uma competição</p>
              {sideLinks.map((l, i) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="flex items-center justify-end gap-3 text-xs tracking-widest uppercase text-gray-400 hover:text-efa-gold transition-colors group"
                >
                  <span>{i + 1}. {l.label}</span>
                  <span className="w-5 h-0.5 bg-gray-600 group-hover:bg-efa-gold transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom gold bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-efa-gold to-transparent" />
      </section>

      {/* ── FILOSOFIA ── */}
      <section id="filosofia" className="py-20 px-6 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-0.5 w-8 bg-efa-gold" />
            <h2 className="text-efa-gold text-xs font-bold tracking-[0.3em] uppercase">Filosofia</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <p className="text-gray-300 text-sm leading-relaxed">
                Na <strong className="text-white">Evolution Fencing Academy</strong> acreditamos que o mais importante
                não é ganhar uma prova, mas sim{' '}
                <em className="text-efa-gold not-italic font-semibold">participar, aprender e evoluir</em>,
                tanto como atleta como enquanto pessoa.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Cada competição representa uma oportunidade para desenvolver competências técnicas, fortalecer
                valores como o respeito, a disciplina e o espírito de equipa, e criar experiências que contribuam
                para o crescimento desportivo, pessoal e humano de cada participante.
              </p>
            </div>
            <div className="border-l border-efa-gold/30 pl-8 space-y-3">
              <p className="text-efa-gold/80 text-lg font-light italic leading-relaxed">
                "Bem-vindos ao lugar onde cada toque é mais um passo na vossa evolução."
              </p>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-8 bg-efa-gold/40" />
                <span className="text-efa-gold/40 text-xs tracking-widest uppercase">EFA Circuit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ESCALÕES ── */}
      <section id="escaloes" className="py-20 px-6 border-b border-white/5">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-0.5 w-8 bg-efa-gold" />
            <h2 className="text-efa-gold text-xs font-bold tracking-[0.3em] uppercase">Escalões</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {escaloes.map((e) => (
              <div
                key={e.name}
                className="border border-white/10 bg-white/[0.02] p-6 space-y-4 hover:border-efa-gold/40 transition-colors group"
              >
                <div className="text-2xl">{e.icon}</div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-efa-gold transition-colors">{e.name}</h3>
                  <p className="text-efa-gold text-xs font-semibold tracking-widest uppercase mt-0.5">{e.age}</p>
                </div>
                <ul className="space-y-2">
                  {e.items.map((item) => (
                    <li key={item} className="text-xs text-gray-500 flex gap-2">
                      <span className="text-efa-gold/60 mt-0.5 shrink-0">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGULAMENTO ── */}
      <section id="regulamento" className="py-20 px-6 border-b border-white/5">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-0.5 w-8 bg-efa-gold" />
            <h2 className="text-efa-gold text-xs font-bold tracking-[0.3em] uppercase">Regulamento</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {regulamento.map((r) => (
              <div key={r.title} className="flex gap-4 border border-white/5 bg-white/[0.02] p-5 hover:border-efa-gold/20 transition-colors">
                <span className="text-xl shrink-0">{r.icon}</span>
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">{r.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OBJETIVOS ── */}
      <section id="objetivos" className="py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-0.5 w-8 bg-efa-gold" />
            <h2 className="text-efa-gold text-xs font-bold tracking-[0.3em] uppercase">Objetivos do Circuito</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Proporcionar mais oportunidades competitivas',
              'Promover a aprendizagem e desenvolvimento técnico',
              'Desenvolver competências táticas e de decisão',
              'Incentivar o espírito de equipa e cooperação',
              'Promover o respeito, fair play e responsabilidade',
              'Valorizar a participação e evolução individual',
              'Contribuir para o crescimento da Esgrima em Portugal',
            ].map((obj) => (
              <div key={obj} className="flex items-center gap-3 py-3 border-b border-white/5">
                <span className="text-efa-gold text-lg leading-none">✦</span>
                <span className="text-gray-300 text-sm">{obj}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA bottom ── */}
      <section className="py-16 px-6 border-t border-efa-gold/20 bg-black text-center space-y-5">
        <img src={efaLogo} alt="EFA" className="w-16 h-16 rounded-full object-cover mx-auto border border-efa-gold/30" />
        <h2 className="text-2xl font-black tracking-wide">Pronto para competir?</h2>
        <p className="text-gray-400 text-sm">Inscreve o teu clube e entra no circuito.</p>
        <Link
          to="/inscricao"
          className="inline-block bg-efa-gold text-black font-bold px-8 py-3 text-xs tracking-widest uppercase hover:brightness-110 transition-all"
        >
          Inscrever Clube →
        </Link>
      </section>
    </div>
  )
}
