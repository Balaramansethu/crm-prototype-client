import { useEffect, useState } from "react"

export function DatasackLoader({ onComplete }) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => setProgress(100), 100)
        const completeTimer = setTimeout(() => {
            if (onComplete) onComplete()
        }, 700)
        
        return () => {
            clearTimeout(timer)
            clearTimeout(completeTimer)
        }
    }, [onComplete])

    return (
        <div className="flex flex-col items-center justify-center h-screen w-full bg-background gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Datasack
            </h1>
            <div className="h-1.5 w-[200px] overflow-hidden rounded-full bg-primary/20">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-in-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}
