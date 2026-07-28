import { HashRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import InscricaoPage from './pages/InscricaoPage'
import AdminPage from './pages/AdminPage'
import LivePage from './pages/LivePage'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/inscricao" element={<InscricaoPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/live" element={<LivePage />} />
          </Routes>
        </main>
        <footer className="bg-efa-blue text-white text-center text-xs py-3 mt-8">
          © {new Date().getFullYear()} Evolution Fencing Academy · Training for Life
        </footer>
      </div>
    </HashRouter>
  )
}
