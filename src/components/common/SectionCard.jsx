import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function SectionCard({ title, children, className }) {
    return (
        <Card className={cn(className)}>
            <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-base sm:text-lg font-semibold">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 px-4 sm:px-6 pb-4 sm:pb-6">
                {children}
            </CardContent>
        </Card>
    )
}
