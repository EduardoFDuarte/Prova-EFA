import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import efaLogo from '../assets/efa_logo.jpeg'

const navItems = [
  { to: '/', label: 'Início' },
  { to: '/live', label: 'Live' },
  { to: '/admin', label: 'Admin' },
  { to: '/inscricao', label: 'Inscrições' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-black text-white sticky top-0 z-50 border-b border-efa-gold/30">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={efaLogo} alt="EFA Logo" className="h-12 w-12 rounded-full object-cover" />
          <div className="leading-tight">
            <div className="text-efa-gold text-xl font-black tracking-widest">EFA</div>
            <div className="text-[10px] text-gray-400 tracking-[0.2em] uppercase">Evolution Fencing Academy</div>
            <div className="text-[9px] text-efa-gold/60 tracking-[0.25em] uppercase">Training for Life</div>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-4 py-2 text-xs font-semibold tracking-widest uppercase transition-colors relative ${
                  isActive
                    ? 'text-efa-gold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-efa-gold'
                    : 'text-gray-300 hover:text-efa-gold'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
          <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${open ? 'opacity-0' : ''}`} />
          <div className={`w-5 h-0.5 bg-white transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="sm:hidden border-t border-efa-gold/20 bg-[#0d0d1a]">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-6 py-3 text-xs font-semibold tracking-widest uppercase border-b border-white/5 transition-colors ${
                  isActive ? 'text-efa-gold' : 'text-gray-300 hover:text-efa-gold'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
