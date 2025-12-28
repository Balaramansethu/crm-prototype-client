import { useDrop } from "react-dnd"
import { ITEM_TYPE } from "./PipelineCard"
import PipelineCard from "./PipelineCard"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

export default function PipelineColumn({
    stage,
    pipelines,
    onDrop,
    onEdit,
    onDelete,
}) {
    const { t } = useTranslation()

    const [{ isOver, canDrop }, drop] = useDrop(
        () => ({
            accept: ITEM_TYPE,
            drop: (item) => {
                if (item.currentStage !== stage.id) {
                    onDrop(item.id, stage.id)
                }
            },
            canDrop: (item) => item.currentStage !== stage.id,
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        }),
        [stage.id, onDrop],
    )

    const columnCards = pipelines.filter((p) => p.opportunityStage === stage.id)

    const isDropTarget = isOver && canDrop

    return (
        <div className="flex flex-col h-full rounded-xl bg-slate-50/80 outline-none ring-0 overflow-hidden">
            {/* Column Header - STATIC, doesn't scroll */}
            <div className="px-3 py-3 border-b border-slate-200/60 shrink-0 bg-slate-50/80 rounded-t-xl">
                <div className="flex items-center justify-center gap-2">
                    <h3 className="font-semibold text-xs text-slate-700 truncate">
                        {t(stage.id) || stage.label}
                    </h3>
                    <span className="text-xs font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded-full border border-slate-200">
                        {columnCards.length}
                    </span>
                </div>
            </div>

            {/* Cards Container - ONLY this scrolls vertically */}
            <div
                ref={drop}
                className={cn(
                    "flex-1 overflow-y-auto p-2 space-y-2 transition-all duration-200",
                    isDropTarget && "bg-blue-50/50",
                )}
            >
                {columnCards.length === 0 ? (
                    <div
                        className={cn(
                            "flex items-center justify-center h-14 rounded-lg border-2 border-dashed transition-colors",
                            isDropTarget
                                ? "border-primary/40 bg-primary/5 text-primary"
                                : "border-slate-200 text-slate-400",
                        )}
                    >
                        <span className="text-xs">
                            {isDropTarget
                                ? t("dropHere") || "Drop here"
                                : t("noOpportunities")}
                        </span>
                    </div>
                ) : (
                    <>
                        {columnCards.map((pipeline) => (
                            <PipelineCard
                                key={pipeline._id}
                                pipeline={pipeline}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                        {/* Drop indicator when dragging over column with cards */}
                        {isDropTarget && (
                            <div className="flex items-center justify-center h-10 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 text-primary text-xs shrink-0">
                                {t("dropHere") || "Drop here"}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
