import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  CalendarRange,
  Camera,
  CheckCircle2,
  ChefHat,
  Clock3,
  Filter,
  Flame,
  Leaf,
  LogOut,
  MoonStar,
  Package,
  Search,
  Settings,
  Sparkles,
  SunMedium,
  Trash2,
  TrendingUp,
  UploadCloud,
  UserCircle2,
  Utensils,
} from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  username: z.string().min(2, 'Username is required'),
  email: z.string().email('Use a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
})

const ingredientSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  quantity: z.coerce.number().min(0.1),
  unit: z.string().min(1),
  purchase_date: z.string().optional().or(z.literal('')),
  expiry_date: z.string().optional().or(z.literal('')),
  storage_location: z.string().min(1),
  notes: z.string().optional(),
})

const mealSchema = z.object({
  day: z.string().min(1),
  meal_type: z.string().min(1),
  recipe_name: z.string().min(2),
  notes: z.string().optional(),
})

type AuthUser = {
  id: number
  email: string
  username: string
  is_active: boolean
  profile: {
    full_name: string
    dietary_focus: string
    city: string
    theme: string
  }
}

type Ingredient = {
  id: number
  name: string
  category: string
  quantity: number
  unit: string
  purchase_date: string | null
  expiry_date: string | null
  storage_location: string
  notes: string | null
  is_consumed: boolean
  is_wasted: boolean
  created_at: string
}

type Recipe = {
  id: number
  name: string
  description: string
  category: string
  cuisine: string
  vegetarian: boolean
  prep_time: number
  cook_time: number
  servings: number
  ingredients: string[]
  instructions: string[]
  nutrition: Record<string, number | string>
  difficulty: string
}

type Recommendation = {
  id: number
  name: string
  description: string
  match_percentage: number
  available_ingredients: string[]
  missing_ingredients: string[]
  difficulty: string
  prep_time: number
  cook_time: number
  cuisine: string
  vegetarian: boolean
}

type MealPlan = {
  id: number
  day: string
  meal_type: string
  recipe_name: string
  notes?: string | null
  created_at: string
}

type NotificationItem = {
  id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
}

type AnalyticsData = {
  cards: Array<{ label: string; value: number }>
  chart_data: Array<{ name: string; consumed: number; wasted: number }>
  utilization: number
  expiring_today: number
  expiring_soon: number
}

function useApi(token: string | null) {
  return useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    return instance
  }, [token])
}

function ProtectedRoute({ token }: { token: string | null }) {
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <AppLayout token={token} />
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('leftover_token'))
  const api = useApi(token)

  useEffect(() => {
    if (!token) {
      return
    }
    api
      .get('/profile/me')
      .catch(() => {
        localStorage.removeItem('leftover_token')
        setToken(null)
      })
  }, [api, token])

  return (
    <BrowserRouter>
      <div>
        <div className="min-h-screen bg-[#f3f6f3] text-slate-800 dark:bg-slate-950 dark:text-slate-200">
          <Routes>
            <Route path="/" element={<LandingPage token={token} />} />
            <Route path="/login" element={<LoginPage setToken={setToken} />} />
            <Route path="/register" element={<RegisterPage setToken={setToken} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/*" element={<ProtectedRoute token={token} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

function AppLayout({ token }: { token: string | null }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const api = useApi(token)

  useEffect(() => {
    if (!token) return
    api.get('/profile/me').then((res) => setUser(res.data)).catch(() => {})
  }, [api, token])

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: Sparkles },
    { label: 'Scanner', path: '/scanner', icon: Camera },
    { label: 'Pantry', path: '/pantry', icon: Package },
    { label: 'Recipes', path: '/recipes', icon: ChefHat },
    { label: 'Planner', path: '/planner', icon: CalendarRange },
    { label: 'Analytics', path: '/analytics', icon: TrendingUp },
    { label: 'Profile', path: '/profile', icon: UserCircle2 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ]

  const logOut = () => {
    localStorage.removeItem('leftover_token')
    navigate('/login')
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-200' : ''}`}>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-emerald-200 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90 lg:flex">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-orange-400 text-xl font-bold text-white shadow-lg shadow-emerald-200">
            AI
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Smart</p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Leftover Planner</h2>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition ${
                location.pathname === path
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto rounded-3xl bg-gradient-to-br from-emerald-600 to-orange-500 p-5 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Demo board</p>
          <h3 className="mt-2 text-xl font-bold">Waste reduction score</h3>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-black">82%</span>
            <span className="pb-1 text-sm text-emerald-100">+14% this week</span>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/75 p-4 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/75">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-orange-400 font-bold text-white">
                AI
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Leftover</p>
                <h1 className="text-base font-bold text-slate-900 dark:text-white">Planner</h1>
              </div>
            </div>

            <div className="hidden items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-2 text-sm text-slate-700 lg:flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Search size={16} />
              Search ingredients, recipes, or meals
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setDarkMode((v) => !v)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300">
                {darkMode ? <SunMedium size={18} /> : <MoonStar size={18} />}
              </button>
              <Link to="/notifications" className="relative rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300">
                <Bell size={18} />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-400 text-[10px] font-bold text-white">3</span>
              </Link>
              <button onClick={logOut} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:border-slate-700">
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 pb-24 md:p-6 md:pb-24 lg:pb-6">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage token={token} user={user} />} />
            <Route path="/scanner" element={<ScannerPage token={token} />} />
            <Route path="/pantry" element={<PantryPage token={token} />} />
            <Route path="/recipes" element={<RecipesPage token={token} />} />
            <Route path="/recipe/:id" element={<RecipeDetailsPage token={token} />} />
            <Route path="/planner" element={<PlannerPage token={token} />} />
            <Route path="/analytics" element={<AnalyticsPage token={token} />} />
            <Route path="/profile" element={<ProfilePage token={token} />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage token={token} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
      <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden dark:border-slate-700 dark:bg-slate-900/95">
        {navItems.slice(0, 5).map(({ label, path, icon: Icon }) => (
          <Link key={path} to={path} className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-medium ${location.pathname === path ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

function LandingPage({ token }: { token: string | null }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),transparent_35%),linear-gradient(135deg,#f8fff8_0%,#fffaf2_40%,#fdf2f8_100%)]">
      <header className="mx-auto flex max-w-7xl items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-orange-400 text-lg font-black text-white shadow-lg shadow-emerald-200">
            AI
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Leftover</p>
            <h1 className="text-xl font-black text-slate-900">Planner</h1>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          <Link to="/about">About</Link>
          <Link to="/login">Login</Link>
          <Link to="/register" className="rounded-full bg-emerald-600 px-4 py-2 text-white shadow-lg shadow-emerald-200">Get started</Link>
        </nav>
      </header>

      <main className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
            <Sparkles size={16} />
            Smart home food planning
          </div>
          <div className="space-y-5">
            <h2 className="text-5xl font-black tracking-tight text-slate-900 md:text-6xl">
              Cut waste. Cook smarter.
            </h2>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              Track ingredients, scan food, monitor freshness, and turn leftovers into practical meals with a smart pantry assistant.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to={token ? '/dashboard' : '/login'} className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700">
              Launch app
            </Link>
            <Link to="/about" className="rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-800 shadow-sm hover:border-emerald-200 hover:text-emerald-700">
              Learn more
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { label: 'Pantry items', value: '5' },
              { label: 'Recipe ideas', value: '8' },
              { label: 'Expiring soon', value: '4' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-emerald-100 bg-white/80 p-3 shadow-sm sm:p-4">
                <div className="text-xl font-black text-slate-900 sm:text-2xl">{stat.value}</div>
                <div className="mt-1 text-xs leading-4 text-slate-600 sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[28px] border border-emerald-100 bg-white/80 p-6 shadow-2xl shadow-emerald-100 backdrop-blur-xl">
          <div className="rounded-[22px] bg-gradient-to-br from-emerald-500 via-emerald-600 to-orange-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">This week</p>
                <h3 className="mt-2 text-3xl font-black">1 meal planned</h3>
              </div>
              <div className="rounded-2xl bg-white/15 p-3"><ChefHat size={28} /></div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Pantry</p>
                <p className="mt-2 text-2xl font-black">5 items</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Expiry</p>
                <p className="mt-2 text-2xl font-black">4 items</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {['Tomato Rice', 'Vegetable Soup', 'Fruit Salad'].map((meal, index) => (
              <div key={meal} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${index % 2 === 0 ? 'bg-emerald-500' : 'bg-orange-400'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{meal}</p>
                    <p className="text-xs text-slate-500">Ready in 20 min</p>
                  </div>
                </div>
                <CheckCircle2 className="text-emerald-500" size={18} />
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

function LoginPage({ setToken }: { setToken: (token: string | null) => void }) {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) })
  const [status, setStatus] = useState('')

  const onSubmit = async (values: { email: string; password: string }) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, values)
      localStorage.setItem('leftover_token', res.data.access_token)
      setToken(res.data.access_token)
      setStatus('Login successful')
      navigate('/dashboard')
    } catch (error: any) {
      setStatus(error?.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-orange-50 to-white p-6">
      <div className="w-full max-w-md rounded-[28px] border border-emerald-100 bg-white p-8 shadow-2xl shadow-emerald-100">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-600">Welcome back</p>
        <h2 className="mt-3 text-3xl font-black text-slate-900">Login</h2>
        <p className="mt-2 text-slate-500">Use the demo account or create a new profile.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input {...register('email')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400" placeholder="demo@leftover.ai" />
            {errors.email && <p className="mt-1 text-sm text-red-500">{String(errors.email.message)}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" {...register('password')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400" placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-sm text-red-500">{String(errors.password.message)}</p>}
          </div>

          <button type="submit" className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700">
            Sign in
          </button>

          {status && <p className="text-sm text-slate-600">{status}</p>}
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <Link to="/forgot-password" className="text-emerald-600">Forgot password?</Link>
          <Link to="/register" className="text-emerald-600">Create account</Link>
        </div>
      </div>
    </div>
  )
}

function RegisterPage({ setToken }: { setToken: (token: string | null) => void }) {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(registerSchema) })
  const [status, setStatus] = useState('')

  const onSubmit = async (values: { username: string; email: string; password: string }) => {
    try {
      await axios.post(`${API_URL}/auth/register`, values)
      const loginRes = await axios.post(`${API_URL}/auth/login`, { email: values.email, password: values.password })
      localStorage.setItem('leftover_token', loginRes.data.access_token)
      setToken(loginRes.data.access_token)
      setStatus('Registration successful')
      navigate('/dashboard')
    } catch (error: any) {
      setStatus(error?.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-6">
      <div className="w-full max-w-md rounded-[28px] border border-orange-200 bg-white p-8 shadow-2xl shadow-orange-100">
        <p className="text-sm uppercase tracking-[0.25em] text-orange-500">New user</p>
        <h2 className="mt-3 text-3xl font-black text-slate-900">Create account</h2>
        <p className="mt-2 text-slate-500">Start tracking ingredients and reduce waste today.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
            <input {...register('username')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400" placeholder="Asha" />
            {errors.username && <p className="mt-1 text-sm text-red-500">{String(errors.username.message)}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input {...register('email')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400" placeholder="user@email.com" />
            {errors.email && <p className="mt-1 text-sm text-red-500">{String(errors.email.message)}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" {...register('password')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400" placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-sm text-red-500">{String(errors.password.message)}</p>}
          </div>

          <button type="submit" className="w-full rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600">
            Register
          </button>
        </form>

        {status && <p className="mt-4 text-sm text-slate-600">{status}</p>}
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-orange-500">Login</Link>
        </p>
      </div>
    </div>
  )
}

function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-6">
      <div className="w-full max-w-md rounded-[28px] border border-emerald-100 bg-white p-8 shadow-lg">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-600">Local demo</p>
        <h2 className="mt-3 text-3xl font-black text-slate-900">Reset password</h2>
        <p className="mt-3 text-slate-600">
          This demo uses a local-only password reset flow. The sample account is demo@leftover.ai with password Demo123!.
        </p>
        <Link to="/login" className="mt-8 inline-flex rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white">Back to login</Link>
      </div>
    </div>
  )
}

function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl p-10">
      <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-600">About project</p>
        <h2 className="mt-3 text-4xl font-black text-slate-900">AI Leftover Food Planner</h2>
        <p className="mt-4 text-slate-600">
          The project helps users manage food inventory, estimate expiry dates, prepare sensible recipes, and reduce daily household waste using local-first tools without depending on a public cloud service.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {['Food scanning', 'Recipe matching', 'Waste analytics'].map((feature) => (
            <div key={feature} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <Leaf className="text-emerald-500" size={24} />
              <p className="mt-3 text-lg font-bold text-slate-900">{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DashboardPage({ token, user }: { token: string | null; user: AuthUser | null }) {
  const [summary, setSummary] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [alerts, setAlerts] = useState<NotificationItem[]>([])
  const api = useApi(token)

  useEffect(() => {
    if (!token) return
    Promise.all([
      api.get('/analytics'),
      api.get('/recipes/recommendations'),
      api.get('/notifications'),
    ]).then(([analyticsRes, recipesRes, alertsRes]) => {
      setSummary(analyticsRes.data)
      setRecommendations(recipesRes.data)
      setAlerts(alertsRes.data)
    })
  }, [api, token])

  const cards = summary?.cards ?? [
    { label: 'Total ingredients', value: 0 },
    { label: 'Consumed', value: 0 },
    { label: 'Wasted', value: 0 },
    { label: 'Expiring soon', value: 0 },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Dashboard</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Welcome back, {user?.profile?.full_name || 'Chef'}</h2>
        </div>
        <Link to="/scanner" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-200">
          <Camera size={18} />
          Scan ingredient
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((stat: any, index: number) => (
          <div key={stat.label} className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-lg shadow-emerald-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{stat.label}</span>
              <div className={`rounded-xl p-2 ${index % 2 === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                {index % 2 === 0 ? <Package size={18} /> : <Flame size={18} />}
              </div>
            </div>
            <div className="mt-6 text-3xl font-black text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Weekly usage</h3>
            <p className="text-sm text-emerald-600">+12% from last week</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.chart_data || [{ name: 'Mon', consumed: 4, wasted: 1 }, { name: 'Tue', consumed: 5, wasted: 2 }, { name: 'Wed', consumed: 6, wasted: 2 }] }>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="consumed" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="wasted" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Alerts</h3>
            <Bell className="text-amber-500" size={18} />
          </div>
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{alert.title}</p>
                  {!alert.is_read && <span className="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold uppercase text-orange-700">New</span>}
                </div>
                <p className="mt-1 text-sm text-slate-600">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Recommended recipes</h3>
            <Link to="/recipes" className="text-sm font-semibold text-emerald-600">View all</Link>
          </div>

          <div className="space-y-4">
            {recommendations.slice(0, 3).map((item) => (
              <Link to={`/recipe/${item.id}`} key={item.id} className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{item.name}</h4>
                    <p className="text-sm text-slate-500">{item.cuisine} • {item.prep_time} min</p>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-sm font-bold text-emerald-700">{item.match_percentage}% match</div>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
          <h3 className="text-xl font-bold text-slate-900">Storage health</h3>
          <div className="mt-6 space-y-4">
            {[
              { label: 'Freshness estimate', value: '86%', tone: 'emerald' },
              { label: 'Ingredient utilization', value: `${summary?.utilization ?? 72}%`, tone: 'orange' },
              { label: 'Alerts resolved', value: '4', tone: 'sky' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{stat.label}</span>
                  <span className="text-lg font-black text-slate-900">{stat.value}</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-orange-400" style={{ width: String(stat.value).replace('%', '') || '80%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ScannerPage({ token }: { token: string | null }) {
  const [label, setLabel] = useState('Tomato')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const api = useApi(token)

  const handleScan = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('label', label)
      const response = await api.post('/scan/recognize', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(response.data)
    } catch (error) {
      setResult({ prediction: 'manual-confirmation', recommended_action: 'The model is not available, so please confirm the ingredient manually.' })
    } finally {
      setLoading(false)
    }
  }

  const addToPantry = async () => {
    if (!result?.label) return
    try {
      await api.post('/ingredients', { name: result.label, category: 'vegetable', quantity: 1, unit: 'pcs', storage_location: 'fridge' })
      alert('Ingredient added to pantry successfully')
    } catch (error) {
      alert('Could not add ingredient')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">AI food scanner</p>
        <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Recognize food items</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50 p-8 text-center">
            <UploadCloud className="mx-auto mb-3 text-emerald-600" size={36} />
            <p className="text-lg font-semibold text-slate-900">Upload or capture food image</p>
            <p className="mt-2 text-sm text-slate-500">This build includes a safe manual fallback when a trained model is not installed locally.</p>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">Ingredient label</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-400" placeholder="Tomato" />
            <button onClick={handleScan} className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-200">
              {loading ? 'Scanning...' : 'Analyze image'}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <h3 className="text-xl font-bold text-slate-900">Prediction result</h3>
          {result ? (
            <div className="mt-6 space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase tracking-[0.2em] text-emerald-700">Detected</span>
                <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-sm font-bold text-white">{result.confidence || 0}%</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{result.label || result.prediction}</p>
              <p className="text-slate-600">{result.recommended_action}</p>
              <button onClick={addToPantry} className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white">Add to pantry</button>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
              No scan result yet. Enter an ingredient or upload an image to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PantryPage({ token }: { token: string | null }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [query, setQuery] = useState('')
  const api = useApi(token)

  const fetchIngredients = async () => {
    const res = await api.get('/ingredients')
    setIngredients(res.data)
  }

  useEffect(() => { fetchIngredients() }, [api])

  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(ingredientSchema) })

  const onSubmit = async (values: any) => {
    await api.post('/ingredients', {
      ...values,
      purchase_date: values.purchase_date || null,
      expiry_date: values.expiry_date || null,
      notes: values.notes || '',
    })
    reset()
    fetchIngredients()
  }

  const filtered = ingredients.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Pantry</p>
        <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Ingredient inventory</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
          <h3 className="text-xl font-bold text-slate-900">Add ingredient</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
            <input {...register('name')} placeholder="Ingredient name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input {...register('category')} placeholder="Category" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
              <input type="number" step="0.1" {...register('quantity')} placeholder="Quantity" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input {...register('unit')} placeholder="Unit" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
              <input {...register('storage_location')} placeholder="Storage location" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="date" {...register('purchase_date')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
              <input type="date" {...register('expiry_date')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <textarea {...register('notes')} rows={3} placeholder="Notes" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <button type="submit" className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white">Save ingredient</button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-slate-900">Inventory list</h3>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3" />
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.quantity} {item.unit} • {item.category} • {item.storage_location}</p>
                  <p className="mt-1 text-xs text-slate-500">Expiry: {item.expiry_date || 'Not set'}</p>
                </div>
                <button
                  onClick={async () => { await api.delete(`/ingredients/${item.id}`); fetchIngredients() }}
                  className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RecipesPage({ token }: { token: string | null }) {
  const [items, setItems] = useState<Recommendation[]>([])
  const api = useApi(token)

  useEffect(() => {
    if (!token) return
    api.get('/recipes/recommendations').then((res) => setItems(res.data))
  }, [api, token])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Recipes</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Smart recommendations</h2>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <Filter size={16} />
          Filter menu
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {items.map((item) => (
          <Link key={item.id} to={`/recipe/${item.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">{item.cuisine}</p>
                <h3 className="mt-2 text-2xl font-black text-slate-900">{item.name}</h3>
              </div>
              <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-sm font-bold text-emerald-700">{item.match_percentage}%</div>
            </div>
            <p className="mt-3 text-slate-600">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-slate-100 px-2 py-1">{item.difficulty}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">{item.prep_time} min</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">{item.cook_time} min cook</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>Missing: {item.missing_ingredients.join(', ') || 'None'}</span>
              <ArrowRight className="text-emerald-600" size={18} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function RecipeDetailsPage({ token }: { token: string | null }) {
  const { id } = useParams()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const api = useApi(token)

  useEffect(() => {
    if (!token || !id) return
    api.get(`/recipes/${id}`).then((res) => setRecipe(res.data))
  }, [api, id, token])

  if (!recipe) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">{recipe.cuisine}</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">{recipe.name}</h2>
          </div>
          <button onClick={() => api.post(`/recipes/${recipe.id}/save`)} className="rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white">Save recipe</button>
        </div>

        <p className="mt-4 max-w-3xl text-slate-600">{recipe.description}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { icon: Clock3, label: 'Prep', value: `${recipe.prep_time} min` },
            { icon: Utensils, label: 'Cook', value: `${recipe.cook_time} min` },
            { icon: UsersIcon, label: 'Servings', value: `${recipe.servings}` },
            { icon: Leaf, label: 'Diet', value: recipe.vegetarian ? 'Vegetarian' : 'Non-veg' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Icon className="text-emerald-600" size={18} />
              <p className="mt-2 text-sm text-slate-500">{label}</p>
              <p className="mt-1 font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <h3 className="text-xl font-bold text-slate-900">Ingredients</h3>
          <ul className="mt-4 space-y-2 text-slate-600">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient} className="flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={16} /> {ingredient}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <h3 className="text-xl font-bold text-slate-900">Nutrition</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(recipe.nutrition).map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm text-slate-500">{key}</p>
                <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <h3 className="text-xl font-bold text-slate-900">Instructions</h3>
        <ol className="mt-4 space-y-3 text-slate-600">
          {recipe.instructions.map((step, index) => (
            <li key={step} className="flex gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">{index + 1}</span><span>{step}</span></li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function PlannerPage({ token }: { token: string | null }) {
  const [plans, setPlans] = useState<MealPlan[]>([])
  const [recipeList, setRecipeList] = useState<string[]>([])
  const api = useApi(token)
  const { register, handleSubmit } = useForm({ resolver: zodResolver(mealSchema) })

  useEffect(() => {
    if (!token) return
    Promise.all([api.get('/meal-plans'), api.get('/recipes')]).then(([plansRes, recipesRes]) => {
      setPlans(plansRes.data)
      setRecipeList(recipesRes.data.map((recipe: Recipe) => recipe.name))
    })
  }, [api, token])

  const onSubmit = async (values: any) => {
    await api.post('/meal-plans', values)
    const res = await api.get('/meal-plans')
    setPlans(res.data)
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Meal planner</p>
        <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Weekly food plan</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
          <h3 className="text-xl font-bold text-slate-900">Add plan</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
            <input {...register('day')} placeholder="Day" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <input {...register('meal_type')} placeholder="Meal type (Lunch / Dinner)" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <select {...register('recipe_name')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <option value="">Select recipe</option>
              {recipeList.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            <textarea {...register('notes')} rows={3} placeholder="Notes" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <button type="submit" className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white">Plan meal</button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
          <h3 className="text-xl font-bold text-slate-900">This week</h3>
          <div className="mt-5 space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="font-bold text-slate-900">{plan.recipe_name}</p>
                  <p className="text-sm text-slate-500">{plan.day} • {plan.meal_type}</p>
                </div>
                <button onClick={async () => { await api.delete(`/meal-plans/${plan.id}`); const res = await api.get('/meal-plans'); setPlans(res.data) }} className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AnalyticsPage({ token }: { token: string | null }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const api = useApi(token)

  useEffect(() => {
    if (!token) return
    api.get('/analytics').then((res) => setAnalytics(res.data))
  }, [api, token])

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Analytics</p>
        <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Food waste dashboard</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analytics?.cards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{card.value}</p>
          </div>
        )) ?? [1, 2, 3, 4].map(() => <div key={Math.random()} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">Loading...</div>)}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
          <h3 className="text-xl font-bold text-slate-900">Food usage trend</h3>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.chart_data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="consumed" stroke="#10b981" strokeWidth={3} />
                <Line type="monotone" dataKey="wasted" stroke="#f59e0b" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
          <h3 className="text-xl font-bold text-slate-900">Waste split</h3>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="value" data={[{ name: 'Used', value: analytics?.utilization ?? 70 }, { name: 'Wasted', value: 100 - (analytics?.utilization ?? 70) }]} outerRadius={90} label>
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfilePage({ token }: { token: string | null }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const api = useApi(token)

  useEffect(() => {
    if (!token) return
    api.get('/profile/me').then((res) => setUser(res.data))
  }, [api, token])

  if (!user) return <div>Loading profile...</div>

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Profile</p>
        <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{user.profile.full_name}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Account</p>
          <div className="mt-5 space-y-3 text-slate-600">
            <p><span className="font-bold text-slate-900">Email:</span> {user.email}</p>
            <p><span className="font-bold text-slate-900">City:</span> {user.profile.city}</p>
            <p><span className="font-bold text-slate-900">Diet:</span> {user.profile.dietary_focus}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Profile actions</p>
          <div className="mt-5 space-y-3">
            <button className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white">Update profile</button>
            <button className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-800">Change password</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Settings</p>
        <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Application preferences</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <p className="text-lg font-bold text-slate-900">Alert preferences</p>
          <ul className="mt-4 space-y-3 text-slate-600">
            <li>Expiry reminders enabled</li>
            <li>Daily summary emails off</li>
            <li>Push notifications optional</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <p className="text-lg font-bold text-slate-900">Privacy</p>
          <ul className="mt-4 space-y-3 text-slate-600">
            <li>Local SQLite database only</li>
            <li>No public cloud sync required</li>
            <li>Secure local-only reset workflow</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function NotificationsPage({ token }: { token: string | null }) {
  const [items, setItems] = useState<NotificationItem[]>([])
  const api = useApi(token)

  useEffect(() => {
    if (!token) return
    api.get('/notifications').then((res) => setItems(res.data))
  }, [api, token])

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Notifications</p>
        <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Important pantry updates</h2>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              {!item.is_read && <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase text-orange-700">New</span>}
            </div>
            <p className="mt-2 text-slate-600">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-600">404</p>
        <h2 className="mt-4 text-4xl font-black text-slate-900">Page not found</h2>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white">Back home</Link>
      </div>
    </div>
  )
}

function UsersIcon() { return <UserCircle2 size={18} /> }

export default App
