'use client'

import { useTheme } from 'next-themes'
import { Button } from '../ui/button'
import { Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'

const ThemeToggleButton = () => {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Toggle theme"
            >
                <span className="h-4 w-4" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="secondary"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 rounded-full transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? (
                    <Sun />
                ) : (
                    <Moon />
                )}
                <span className="sr-only">Toggle theme</span>
            </Button>
        </div>
    )
}

export default ThemeToggleButton;