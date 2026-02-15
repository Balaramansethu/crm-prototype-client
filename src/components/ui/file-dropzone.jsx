import { useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { UploadCloud, File as FileIcon, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Reusable File Dropzone Component
 *
 * @param {Object} props
 * @param {File} [props.file] - Currently selected file (for preview)
 * @param {Function} props.onFileSelect - Callback when file is selected (returns File object or null)
 * @param {string[]} [props.acceptedTypes] - Array of accepted MIME types
 * @param {number} [props.maxSize=5] - Max file size in MB
 * @param {boolean} [props.disabled=false] - Whether upload is disabled
 * @param {string} [props.label] - Custom label text
 */
export default function FileDropzone({
    file,
    onFileSelect,
    acceptedTypes = [],
    maxSize = 5, // MB
    disabled = false,
    label,
}) {
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState(null)
    const inputRef = useRef(null)

    const handleDragEnter = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled) setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const validateFile = (fileToValidate) => {
        setError(null)

        // Validate type
        if (
            acceptedTypes.length > 0 &&
            !acceptedTypes.includes(fileToValidate.type)
        ) {
            setError("Invalid file type. Please upload a supported format.")
            return false
        }

        // Validate size
        const fileSizeMB = fileToValidate.size / (1024 * 1024)
        if (fileSizeMB > maxSize) {
            setError(`File size exceeds ${maxSize}MB limit.`)
            return false
        }

        return true
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (disabled) return

        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            const droppedFile = files[0]
            if (validateFile(droppedFile)) {
                onFileSelect(droppedFile)
            }
        }
    }

    const handleFileInput = (e) => {
        const files = e.target.files
        if (files && files.length > 0) {
            const selectedFile = files[0]
            if (validateFile(selectedFile)) {
                onFileSelect(selectedFile)
            }
        }
        // Reset input value to allow re-selecting same file if cleared
        e.target.value = null
    }

    const removeFile = (e) => {
        e.stopPropagation()
        onFileSelect(null)
        setError(null)
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    if (file) {
        return (
            <div className="relative w-full rounded-md border border-input p-4 bg-muted/20">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <p className="truncate text-sm font-medium text-foreground">
                            {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={removeFile}
                        disabled={disabled}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full space-y-2">
            <div
                onClick={() => !disabled && inputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/5 p-6 transition-colors hover:bg-muted/10",
                    isDragging && "border-primary bg-primary/5",
                    disabled &&
                        "cursor-not-allowed opacity-50 hover:bg-muted/5",
                    error && "border-destructive/50 bg-destructive/5",
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={acceptedTypes.join(",")}
                    onChange={handleFileInput}
                    disabled={disabled}
                />
                <div className="flex flex-col items-center justify-center gap-2 text-center text-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <UploadCloud className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="font-medium text-foreground">
                            {label || "Click or drag & drop to upload"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            PDF, DOC, DOCX (max {maxSize}MB)
                        </p>
                    </div>
                </div>
            </div>
            {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
}
