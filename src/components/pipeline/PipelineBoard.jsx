import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { PIPELINE_STAGES } from "@/constants/pipelineOptions"
import PipelineColumn from "./PipelineColumn"

export default function PipelineBoard({
    pipelines,
    onStageDrop,
    onEdit,
    onDelete,
}) {
    return (
        <DndProvider backend={HTML5Backend}>
            {/* Grid layout on large screens, horizontal scroll on smaller screens */}
            <div className="h-full overflow-x-auto xl:overflow-x-hidden">
                <div className="grid grid-cols-6 gap-3 h-full min-w-[1270px] xl:min-w-0">
                    {PIPELINE_STAGES.map((stage) => (
                        <PipelineColumn
                            key={stage.id}
                            stage={stage}
                            pipelines={pipelines}
                            onDrop={onStageDrop}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </div>
        </DndProvider>
    )
}
