import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  center?: boolean
}

export default function SectionTag({ children, center = false }: Props) {
  return (
    <div className={`inline-flex items-center gap-1.5 bg-brand-light border border-brand/20 text-brand-dark text-xs font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-5 ${center ? 'mx-auto' : ''}`}>
      {children}
    </div>
  )
}
