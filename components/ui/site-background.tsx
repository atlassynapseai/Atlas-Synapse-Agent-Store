'use client'

import { useEffect } from 'react'

export function SiteBackground() {
    useEffect(() => {
        const root = document.documentElement
        let frame = 0

        const updatePointer = (clientX: number, clientY: number) => {
            cancelAnimationFrame(frame)
            frame = window.requestAnimationFrame(() => {
                const x = clientX / window.innerWidth
                const y = clientY / window.innerHeight

                root.style.setProperty('--pointer-x', `${(x * 100).toFixed(2)}%`)
                root.style.setProperty('--pointer-y', `${(y * 100).toFixed(2)}%`)
                root.style.setProperty('--parallax-x', `${((x - 0.5) * 36).toFixed(2)}px`)
                root.style.setProperty('--parallax-y', `${((y - 0.5) * 36).toFixed(2)}px`)
            })
        }

        const handleMove = (event: MouseEvent) => updatePointer(event.clientX, event.clientY)
        const handleTouchMove = (event: TouchEvent) => {
            const touch = event.touches[0]
            if (touch) updatePointer(touch.clientX, touch.clientY)
        }

        root.style.setProperty('--pointer-x', '50%')
        root.style.setProperty('--pointer-y', '30%')
        root.style.setProperty('--parallax-x', '0px')
        root.style.setProperty('--parallax-y', '0px')

        window.addEventListener('mousemove', handleMove, { passive: true })
        window.addEventListener('touchmove', handleTouchMove, { passive: true })

        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener('mousemove', handleMove)
            window.removeEventListener('touchmove', handleTouchMove)
        }
    }, [])

    return (
        <div aria-hidden className="site-background">
            <div className="site-background__pointer" />
            <div className="site-background__mesh" />
            <div className="site-background__grid" />
            <div className="site-background__orb site-background__orb--one" />
            <div className="site-background__orb site-background__orb--two" />
            <div className="site-background__orb site-background__orb--three" />
            <div className="site-background__ring" />
            <span className="site-background__spark site-background__spark--1" />
            <span className="site-background__spark site-background__spark--2" />
            <span className="site-background__spark site-background__spark--3" />
            <span className="site-background__spark site-background__spark--4" />
            <span className="site-background__spark site-background__spark--5" />
            <span className="site-background__spark site-background__spark--6" />
        </div>
    )
}
