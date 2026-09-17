import { Link } from 'react-router-dom'

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

export default function HomePage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="relative bg-black text-white py-20 px-6 text-center overflow-hidden">
        {/* decorative gold lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10 max-w-3xl mx-auto space-y-5">
          <div className="inline-block border border-efa-gold text-efa-gold px-5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
            Training for Life
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight">
            Evolution Fencing Academy
            <br />
            <span className="text-efa-gold">Circuit</span>
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Criado para proporcionar mais oportunidades competitivas aos jovens atletas, privilegiando
            a aprendizagem, a diversão, a evolução e o espírito de equipa acima do resultado competitivo.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/live"
              className="flex items-center gap-2 bg-efa-gold text-black font-bold px-6 py-2.5 rounded-full text-sm hover:brightness-110 transition-all"
            >
              <span className="live-pulse" /> Ver ao vivo
            </Link>
            <Link
              to="/inscricao"
              className="border border-white text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-white hover:text-black transition-all"
            >
              Inscrever clube
            </Link>
          </div>
        </div>
      </section>

      {/* Gold divider */}
      <div className="h-1 bg-efa-gold" />

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-12">
        {/* Filosofia */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-efa-gold flex items-center gap-2">📖 Filosofia</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Na <strong className="text-white">Evolution Fencing Academy</strong> acreditamos que o mais importante não é ganhar uma prova,
            mas sim <em className="text-efa-gold">participar, aprender e evoluir</em>, tanto como atleta como enquanto pessoa.
            Cada competição representa uma oportunidade para desenvolver competências técnicas, fortalecer
            valores como o respeito, a disciplina e o espírito de equipa, e criar experiências que contribuam
            para o crescimento desportivo, pessoal e humano de cada participante.
          </p>
          <p className="text-efa-gold font-semibold text-sm italic border-l-2 border-efa-gold pl-3">
            "Bem-vindos ao lugar onde cada toque é mais um passo na vossa evolução."
          </p>
        </section>

        {/* Escalões */}
        <section className="space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            🤺 <span>Escalões</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {escaloes.map((e) => (
              <div key={e.name} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3 border-t-2 border-t-efa-gold">
                <div className="text-2xl">{e.icon}</div>
                <h3 className="font-bold text-white">{e.name}</h3>
                <p className="text-xs text-efa-gold font-semibold">{e.age}</p>
                <ul className="space-y-1.5">
                  {e.items.map((item) => (
                    <li key={item} className="text-xs text-gray-400 flex gap-1.5">
                      <span className="text-efa-gold mt-0.5 shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Regulamento */}
        <section className="space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            📋 <span>Regulamento Resumido</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {regulamento.map((r) => (
              <div key={r.title} className="flex gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-4 items-start">
                <span className="text-xl shrink-0">{r.icon}</span>
                <div>
                  <h4 className="font-semibold text-sm text-efa-gold">{r.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Objetivos */}
        <section className="bg-zinc-950 border border-efa-gold/40 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-efa-gold">🎯 Objetivos do Circuito</h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {[
              'Proporcionar mais oportunidades competitivas',
              'Promover a aprendizagem e desenvolvimento técnico',
              'Desenvolver competências táticas e de decisão',
              'Incentivar o espírito de equipa e cooperação',
              'Promover o respeito, fair play e responsabilidade',
              'Valorizar a participação e evolução individual',
              'Contribuir para o crescimento da Esgrima em Portugal',
            ].map((obj) => (
              <li key={obj} className="flex gap-2 items-start text-gray-300">
                <span className="text-efa-gold mt-0.5 shrink-0">✓</span>
                {obj}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
