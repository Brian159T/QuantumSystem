import { useState } from 'react'
import { UserRound } from 'lucide-react'
import LoginModal from './LoginModal'

export default function LoginButton() {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <button className="boton boton-cuenta" onClick={() => setVisible(true)}>
        <UserRound size={15} />
        Cuenta
      </button>
      <LoginModal visible={visible} onCerrar={() => setVisible(false)} />
    </>
  )
}