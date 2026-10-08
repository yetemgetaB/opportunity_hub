import AppRoutes from './routes/AppRoutes'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { SavedProvider } from './context/SavedContext'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <SavedProvider>
            <AppRoutes />
          </SavedProvider>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}