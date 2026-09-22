import { AuthProvider } from './hooks/AuthProvider'
import AppNavigator from './routes/AppNavigator'

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  )
}