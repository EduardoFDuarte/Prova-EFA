import { Link } from 'react-router-dom'
import efaLogo from '../assets/efa_logo_01.jpg'

export default function HomePage() {
  return (
    <div className="bg-black text-white">
      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-black" />
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
            className="w-[420px] h-[420px] object-contain opacity-[0.08] blur-sm"
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

          {/* Right: logo */}
          <div className="hidden lg:flex flex-col items-center gap-8">
            <img
              src={efaLogo}
              alt="Evolution Fencing Academy"
              className="w-56 h-56 object-cover rounded-full border border-efa-gold/30 drop-shadow-[0_0_30px_rgba(232,184,75,0.3)]"
            />
          </div>
        </div>

        {/* Bottom gold bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-efa-gold to-transparent" />
      </section>

      {/* ── CTA bottom ── */}
      <section className="py-16 px-6 border-t border-efa-gold/20 bg-black text-center space-y-5">
        <img src={efaLogo} alt="EFA" className="w-20 h-20 object-cover rounded-full mx-auto border border-efa-gold/20" />
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
