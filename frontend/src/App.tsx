import AppRoutes from './routes/AppRoutes'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { SavedProvider } from './context/SavedContext'
import { Assistant } from './components/Assistant'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SavedProvider>
          <AppRoutes />
          <Assistant />
        </SavedProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}