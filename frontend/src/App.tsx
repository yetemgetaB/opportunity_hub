import AppRoutes from './routes/AppRoutes'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { SavedProvider } from './context/SavedContext'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SavedProvider>
          <AppRoutes />
        </SavedProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}