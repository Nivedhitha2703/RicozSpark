import { BrowserRouter } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AuthProvider } from './features/auth/AuthContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App