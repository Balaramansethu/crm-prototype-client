import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function SectionCard({ title, children, className }) {
    return (
        <Card className={cn(className)}>
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">{children}</CardContent>
        </Card>
    )
}
