import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

/**
 * Skeleton loader for Pipeline Detail Page.
 * Mirrors the exact layout of PipelineDetailPage.jsx with:
 * - PageHeader (breadcrumb, title with badge, edit button)
 * - 2-column grid with SectionCard/FieldRow structure
 */
export default function PipelineDetailSkeleton() {
    return (
        <div className="flex flex-col flex-1 w-full">
            {/* PageHeader Skeleton */}
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                </div>

                {/* Title & Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-7 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>

            {/* Main Grid - 2 columns matching PipelineDetailPage */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 px-4 lg:px-6 pb-6">
                {/* Opportunity Details Card */}
                <Card>
                    <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                        <Skeleton className="h-5 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-0 px-4 sm:px-6 pb-4 sm:pb-6">
                        {/* Opportunity Stage - with badge */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 py-2.5 sm:py-2 min-h-[40px]">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <Separator />
                        {/* Estimated Value */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 py-2.5 sm:py-2 min-h-[40px]">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Separator />
                        {/* Probability */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 py-2.5 sm:py-2 min-h-[40px]">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <Separator />
                        {/* Expected Revenue */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 py-2.5 sm:py-2 min-h-[40px]">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Separator />
                        {/* Next Step */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 py-2.5 sm:py-2 min-h-[40px]">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </CardContent>
                </Card>

                {/* Company Details Card */}
                <Card>
                    <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                        <Skeleton className="h-5 w-36" />
                    </CardHeader>
                    <CardContent className="space-y-0 px-4 sm:px-6 pb-4 sm:pb-6">
                        {/* Company Header with Icon */}
                        <div className="flex items-center gap-3 mb-4">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <div className="flex-1 min-w-0 space-y-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                        <Separator />
                        {/* Email */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 py-2.5 sm:py-2 min-h-[40px]">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Separator />
                        {/* Phone */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 py-2.5 sm:py-2 min-h-[40px]">
                            <Skeleton className="h-4 w-14" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                        <Separator />
                        {/* Social Profile */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 py-2.5 sm:py-2 min-h-[40px]">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
