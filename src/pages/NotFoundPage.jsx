import { Link } from 'react-router-dom'
import { usePageMeta } from '../usePageMeta'
import { StateMessage } from '../components/Story'

export function NotFoundPage() {
  usePageMeta('Página não encontrada')
  return (
    <StateMessage title="Página não encontrada" text="Esse endereço não faz parte do Vasco News.">
      <Link className="button" to="/">
        Voltar à capa
      </Link>
    </StateMessage>
  )
}
