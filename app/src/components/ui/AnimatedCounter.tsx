import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

interface Props {
  to: number
  duration?: number
  suffix?: string
  separator?: boolean
}

export default function AnimatedCounter({ to, duration = 1800, suffix = '', separator = false }: Props) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })

  useEffect(() => {
    if (!inView) return
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(eased * to)
      setCount(current)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, to, duration])

  const formatted = separator ? count.toLocaleString('ru-RU') : count.toString()

  return (
    <span ref={ref}>
      {formatted}
      {suffix}
    </span>
  )
}
