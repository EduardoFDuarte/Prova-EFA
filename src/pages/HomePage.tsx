import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="bg-black text-white">
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 60px)',
          }}
        />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center space-y-7">
          <div className="space-y-7">
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

            <div className="flex flex-wrap justify-center gap-4 pt-2">
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
</div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-efa-gold to-transparent" />
      </section>
    </div>
  )
}
