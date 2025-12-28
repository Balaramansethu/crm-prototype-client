import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function PipelineDetailSkeleton() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>

            {/* Three Column Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Opportunity Details Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <Skeleton className="h-5 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact & Lead Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-3 w-36" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                        <div className="my-4 border-t border-dashed" />
                        <Skeleton className="h-3 w-24" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </CardContent>
                </Card>

                {/* Company & Info Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <Skeleton className="h-5 w-36" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-3 w-40" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                        <div className="my-4 border-t border-dashed" />
                        <Skeleton className="h-3 w-28" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
