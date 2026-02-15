import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import FileDropzone from "@/components/ui/file-dropzone"
import { FileIcon, ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export default function ProposalUploadSection({
    control,
    setValue,
    watch,
    existingProposalDocument,
    isEditMode,
}) {
    const { t } = useTranslation()
    const [isReplacing, setIsReplacing] = useState(false)
    const proposalDocument = watch("proposalDocument")

    // If no existing file, we are always effectively "replacing" (uploading new)
    useEffect(() => {
        if (!existingProposalDocument) {
            setIsReplacing(true)
        }
    }, [existingProposalDocument])

    // Handler for file selection
    const handleFileSelect = (file) => {
        setValue("proposalDocument", file, {
            shouldDirty: true,
            shouldValidate: true,
        })
    }

    const cancelReplace = () => {
        setIsReplacing(false)
        setValue("proposalDocument", undefined)
    }

    return (
        <div className="space-y-6 pt-4 border-t animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                    {t("proposalDetails")}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {t("proposalDescription")}
                </p>
            </div>

            {/* Proposal Number Input */}
            <FormField
                control={control}
                name="proposalNumber"
                rules={{
                    required: t("proposalNumberRequired"),
                    pattern: {
                        value: /^[a-zA-Z0-9]+$/,
                        message: t("alphanumericOnly"),
                    },
                    maxLength: {
                        value: 50,
                        message: "Max 50 characters",
                    },
                }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("proposalNumber")} *</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                placeholder="PR12345"
                                className="h-10 font-mono"
                                onChange={(e) => {
                                    // Enforce alphanumeric on change as well for better UX
                                    const val = e.target.value.replace(
                                        /[^a-zA-Z0-9]/g,
                                        "",
                                    )
                                    field.onChange(val)
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* File Upload Section */}
            <div className="space-y-3">
                <FormLabel>{t("proposalDocument")} *</FormLabel>

                {!isReplacing && existingProposalDocument ? (
                    <div className="rounded-lg border border-border p-4 bg-muted/30">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <FileIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {existingProposalDocument.originalname ||
                                            "proposal_document.pdf"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {existingProposalDocument.size
                                            ? `${(existingProposalDocument.size / 1024).toFixed(1)} KB`
                                            : "Document"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 justify-start">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                    onClick={() =>
                                        window.open(
                                            existingProposalDocument.s3Url,
                                            "_blank",
                                            "noopener,noreferrer",
                                        )
                                    }
                                >
                                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                    {t("view")}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="h-8"
                                    onClick={() => setIsReplacing(true)}
                                >
                                    {t("replaceFile")}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <FormField
                        control={control}
                        name="proposalDocument"
                        rules={{
                            // Required only if creating, or if editing and replacing (and no file selected yet)
                            // But FormField validation runs on the value.
                            // If isReplacing is true, we need a value.
                            validate: (value) => {
                                if (isReplacing && !value) {
                                    return t("proposalDocumentRequired")
                                }
                                return true
                            },
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <FileDropzone
                                        file={
                                            field.value instanceof File
                                                ? field.value
                                                : null
                                        }
                                        onFileSelect={handleFileSelect}
                                        acceptedTypes={[
                                            "application/pdf",
                                            "application/msword",
                                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                        ]}
                                        maxSize={5}
                                        label={t("uploadProposal")}
                                    />
                                </FormControl>
                                <FormMessage />

                                {isEditMode && existingProposalDocument && (
                                    <div className="flex justify-start">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto px-2 py-1 text-muted-foreground hover:text-foreground"
                                            onClick={cancelReplace}
                                        >
                                            <X className="mr-1 h-3 w-3" />
                                            {t("cancelReplace")}
                                        </Button>
                                    </div>
                                )}
                            </FormItem>
                        )}
                    />
                )}
            </div>
        </div>
    )
}
