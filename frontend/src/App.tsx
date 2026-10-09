import AppRoutes from './routes/AppRoutes'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { SavedProvider } from './context/SavedContext'
import { Assistant } from './components/Assistant'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <SavedProvider>
            <AppRoutes />
            <Assistant />
          </SavedProvider>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
