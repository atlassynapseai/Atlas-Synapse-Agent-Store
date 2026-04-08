'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

export function Reveal({
    children,
    className = '',
    delay = 0,
    y = 24,
}: {
    children: ReactNode
    className?: string
    delay?: number
    y?: number
}) {
    const ref = useRef<HTMLDivElement | null>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    observer.disconnect()
                }
            },
            {
                threshold: 0.14,
                rootMargin: '0px 0px -40px 0px',
            },
        )

        observer.observe(element)

        return () => observer.disconnect()
    }, [])

    const style = {
        '--reveal-delay': `${delay}s`,
        '--reveal-y': `${y}px`,
    } as CSSProperties

    return (
        <div ref={ref} style={style} className={`reveal-up ${visible ? 'is-visible' : ''} ${className}`}>
            {children}
        </div>
    )
}
