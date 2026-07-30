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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-10">
      {/* Hero */}
      <section className="text-center space-y-4 pt-4">
        <div className="inline-block bg-efa-blue text-efa-gold px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-2">
          Training for Life
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-efa-blue leading-tight">
          Evolution Fencing Academy<br />
          <span className="text-efa-gold">Circuit</span>
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Criado para proporcionar mais oportunidades competitivas aos jovens atletas, privilegiando
          a aprendizagem, a diversão, a evolução e o espírito de equipa acima do resultado competitivo.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/live" className="btn-primary flex items-center gap-2">
            <span className="live-pulse" /> Ver ao vivo
          </Link>
          <Link to="/inscricao" className="btn-outline">
            Inscrever clube
          </Link>
        </div>
      </section>

      {/* Filosofia */}
      <section className="card space-y-3">
        <h2 className="text-lg font-bold text-efa-blue">📖 Filosofia</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          Na <strong>Evolution Fencing Academy</strong> acreditamos que o mais importante não é ganhar uma prova,
          mas sim <em>participar, aprender e evoluir</em>, tanto como atleta como enquanto pessoa.
          Cada competição representa uma oportunidade para desenvolver competências técnicas, fortalecer
          valores como o respeito, a disciplina e o espírito de equipa, e criar experiências que contribuam
          para o crescimento desportivo, pessoal e humano de cada participante.
        </p>
        <p className="text-efa-gold font-semibold text-sm italic">
          "Bem-vindos ao lugar onde cada toque é mais um passo na vossa evolução."
        </p>
      </section>

      {/* Programa */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-efa-blue">📅 Programa da Competição</h2>
        <div className="grid sm:grid-cols-2 gap-4">
                 </div>
      </section>

      {/* Escalões */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-efa-blue">🤺 Escalões</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {escaloes.map((e) => (
            <div key={e.name} className="card space-y-2 border-t-4 border-efa-blue">
              <div className="text-2xl">{e.icon}</div>
              <h3 className="font-bold text-efa-blue">{e.name}</h3>
              <p className="text-xs text-efa-gold font-semibold">{e.age}</p>
              <ul className="space-y-1">
                {e.items.map((item) => (
                  <li key={item} className="text-xs text-gray-600 flex gap-1.5">
                    <span className="text-efa-blue mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Regulamento */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-efa-blue">📋 Regulamento Resumido</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {regulamento.map((r) => (
            <div key={r.title} className="flex gap-3 card items-start">
              <span className="text-2xl">{r.icon}</span>
              <div>
                <h4 className="font-semibold text-sm text-efa-blue">{r.title}</h4>
                <p className="text-xs text-gray-600 mt-0.5">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Objetivos */}
      <section className="card bg-efa-blue text-white space-y-3">
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
            <li key={obj} className="flex gap-2 items-start opacity-90">
              <span className="text-efa-gold mt-0.5">✓</span>
              {obj}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
