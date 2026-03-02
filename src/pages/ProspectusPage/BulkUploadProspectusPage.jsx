import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Download, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Stepper } from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import FileDropzone from "@/components/ui/file-dropzone"
import { PageHeader, BulkUploadInstructions } from "@/components/common"
import { submitBulkProspectuses } from "@/service/prospectusService"
import { downloadProspectusTemplate } from "@/utils/prospectusTemplateGenerator"
import { parseCSV, readFileAsText } from "@/utils/csvParser"
import {
    validateCSVRows,
    transformCSVToBackendPayload,
} from "@/utils/bulkUploadTransformer"
import { useQueryClient } from "@tanstack/react-query"

export default function BulkUploadProspectusPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [currentStep, setCurrentStep] = useState(1)
    const [uploadedFile, setUploadedFile] = useState(null)
    const [parsedRows, setParsedRows] = useState([])
    const [validationErrors, setValidationErrors] = useState([])
    const [backendErrors, setBackendErrors] = useState([])
    const [backendPayload, setBackendPayload] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)

    const steps = [
        { label: t("chooseFile") || "Choose File", description: t("uploadCSVFile") || "Upload CSV" },
        { label: t("reviewErrors") || "Review Errors", description: t("fixAnyIssues") || "Fix Issues" },
        { label: t("submitData") || "Submit Data", description: t("confirmUpload") || "Confirm Upload" },
    ]

    // ────────────────────────────────────────────────────────────
    // STEP 1: Download Template
    // ────────────────────────────────────────────────────────────
    const handleDownloadTemplate = () => {
        setIsDownloadingTemplate(true)
        try {
            downloadProspectusTemplate()
            toast.success(t("templateDownloadedSuccessfully") || "Template downloaded successfully")
        } catch (error) {
            console.error("Template download error:", error)
            toast.error(t("failedToDownloadTemplate") || "Failed to download template")
        } finally {
            setIsDownloadingTemplate(false)
        }
    }

    // ────────────────────────────────────────────────────────────
    // STEP 1: Upload & Validate CSV
    // ────────────────────────────────────────────────────────────
    const handleFileUpload = async () => {
        if (!uploadedFile) {
            toast.error(t("pleaseSelectFile") || "Please select a file")
            return
        }

        setIsProcessing(true)
        try {
            // Read file content
            const csvContent = await readFileAsText(uploadedFile)

            // Parse CSV
            const rows = parseCSV(csvContent)

            if (rows.length === 0) {
                toast.error(t("noDataInFile") || "No data found in file")
                setIsProcessing(false)
                return
            }

            setParsedRows(rows)

            // Validate rows
            const validation = validateCSVRows(rows)

            if (!validation.valid) {
                // Has validation errors
                setValidationErrors(validation.errors)
                setCurrentStep(2)
                toast.warning(
                    t("foundValidationErrors", { count: validation.errors.length }) ||
                        `Found ${validation.errors.length} validation errors`,
                )
            } else {
                // All valid, transform to backend format
                const payload = transformCSVToBackendPayload(rows)
                setBackendPayload(payload)
                setValidationErrors([])
                setCurrentStep(3)
                toast.success(
                    t("allRecordsValid") || "All records are valid! Ready to submit.",
                )
            }
        } catch (error) {
            console.error("File processing error:", error)
            toast.error(
                error.message ||
                    t("failedToProcessFile") ||
                    "Failed to process file",
            )
        } finally {
            setIsProcessing(false)
        }
    }

    // ────────────────────────────────────────────────────────────
    // STEP 2: Download Validation/Backend Errors as TXT
    // ────────────────────────────────────────────────────────────
    const handleDownloadErrors = () => {
        const errorsToDownload =
            backendErrors.length > 0 ? backendErrors : validationErrors

        if (!errorsToDownload || errorsToDownload.length === 0) return

        try {
            // Create text content with errors
            const header =
                backendErrors.length > 0
                    ? "SERVER ERRORS - Prospectus Bulk Upload\n" +
                      "=" .repeat(50) +
                      "\n\n" +
                      "These errors occurred when attempting to create records in the system.\n" +
                      "Please fix the issues below and re-upload your CSV file.\n\n" +
                      "=" .repeat(50) +
                      "\n\n"
                    : "VALIDATION ERRORS - Prospectus Bulk Upload\n" +
                      "=" .repeat(50) +
                      "\n\n" +
                      "These errors were found during validation of your CSV file.\n" +
                      "Please fix the issues below and re-upload.\n\n" +
                      "=" .repeat(50) +
                      "\n\n"

            const errorContent = errorsToDownload.join("\n")
            const BOM = "\uFEFF"
            const fullContent = BOM + header + errorContent

            // Create and download blob
            const blob = new Blob([fullContent], {
                type: "text/plain;charset=utf-8;",
            })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            const filename =
                backendErrors.length > 0
                    ? "prospectus_server_errors.txt"
                    : "prospectus_validation_errors.txt"
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success(t("errorsDownloaded") || "Errors downloaded")
        } catch (error) {
            console.error("Download error:", error)
            toast.error(
                t("failedToDownloadErrors") || "Failed to download errors",
            )
        }
    }

    // ────────────────────────────────────────────────────────────
    // STEP 2: Re-upload (go back to Step 1)
    // ────────────────────────────────────────────────────────────
    const handleReUpload = () => {
        setUploadedFile(null)
        setParsedRows([])
        setValidationErrors([])
        setBackendErrors([])
        setBackendPayload(null)
        setCurrentStep(1)
    }

    // ────────────────────────────────────────────────────────────
    // STEP 3: Submit to Backend
    // ────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!backendPayload || backendPayload.length === 0) {
            toast.error(
                t("noValidRecordsToSubmit") || "No valid records to submit",
            )
            return
        }

        setIsSubmitting(true)
        try {
            const result = await submitBulkProspectuses(backendPayload)

            if (result.success) {
                const createdCount =
                    result.data?.length ||
                    backendPayload.reduce(
                        (sum, item) => sum + item.prospectuses.length,
                        0,
                    )

                toast.success(
                    result.message ||
                        t("prospectusesCreatedSuccessfully", {
                            count: createdCount,
                        }) ||
                        `${createdCount} prospectus records created successfully`,
                )

                // Refresh prospectus list
                queryClient.invalidateQueries(["prospectuses"])

                // Navigate back to list
                navigate("/prospectus")
            } else {
                // Handle specific backend errors
                handleBackendError(result)
            }
        } catch (error) {
            console.error("Submission error:", error)
            toast.error(
                t("failedToCreateProspectuses") ||
                    "Failed to create prospectuses. Please try again.",
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    // ────────────────────────────────────────────────────────────
    // Handle Backend Error Codes
    // ────────────────────────────────────────────────────────────
    const handleBackendError = (result) => {
        const { errorCode, errorMessage, data } = result
        const errors = []

        // Build user-friendly error messages
        switch (errorCode) {
            case "4703":
                errors.push(
                    `❌ Company Duplicate: ${errorMessage || "A company with this information already exists in the system"}`,
                )
                toast.error(
                    t("companyDuplicateError") || "Company already exists",
                    { duration: 6000 },
                )
                break
            case "4702":
                errors.push(
                    `❌ Contact Duplicate: ${errorMessage || "A contact with this phone number or email already exists"}`,
                )
                toast.error(
                    t("contactDuplicateError") || "Contact already exists",
                    { duration: 6000 },
                )
                break
            case "1001":
                errors.push(
                    `❌ Validation Error: ${errorMessage || "Invalid data in file"}`,
                )
                toast.error(
                    t("validationError") || "Validation error",
                    { duration: 6000 },
                )
                break
            default:
                errors.push(
                    `❌ Server Error: ${errorMessage || "An unexpected error occurred"}`,
                )
                toast.error(
                    errorMessage || t("unknownServerError") || "Server error",
                )
        }

        // Add helpful tips based on error type
        if (errorCode === "4703" || errorCode === "4702") {
            errors.push("")
            errors.push("💡 How to fix:")
            errors.push(
                "   1. Check if the company/contact already exists in the system",
            )
            errors.push(
                "   2. Remove duplicate entries from your CSV file",
            )
            errors.push("   3. Or update the existing record instead of creating a new one")
        } else if (errorCode === "1001") {
            errors.push("")
            errors.push("💡 How to fix:")
            errors.push("   1. Review the error message above")
            errors.push("   2. Check your CSV file for invalid data")
            errors.push("   3. Ensure all required fields are filled correctly")
        }

        // Set errors and go back to step 2
        setBackendErrors(errors)
        setCurrentStep(2)
    }

    // ────────────────────────────────────────────────────────────
    // RENDER
    // ────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-1 flex-col w-full">
            {/* Breadcrumb Header */}
            <PageHeader
                breadcrumbs={[
                    { label: t("prospectus"), path: "/prospectus" },
                    { label: t("bulkUploadProspectus") || "Bulk Upload" },
                ]}
                title={t("bulkUploadProspectus") || "Bulk Upload Prospectus"}
            />

            {/* Content Area */}
            <div className="flex flex-col gap-6 px-4 lg:px-6 pb-6">
                {/* Description */}
                <p className="text-sm text-muted-foreground -mt-2">
                    {t("bulkUploadDescription") ||
                        "Upload CSV file to create multiple prospectus records at once"}
                </p>

                {/* Stepper */}
                <Stepper currentStep={currentStep} steps={steps} />

            {/* Main Content Card */}
            <div className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm p-6 min-w-0">
                {/* ──────────── STEP 1: Choose & Upload File ──────────── */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold mb-2">
                                {t("chooseYourCSVFile") || "Choose Your CSV File"}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {t("downloadTemplateAndUpload") ||
                                    "Download the template, fill it with data, and upload it here"}
                            </p>
                        </div>

                        {/* Download Template & Instructions Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="outline"
                                onClick={handleDownloadTemplate}
                                disabled={isDownloadingTemplate}
                                className="w-full sm:w-auto"
                            >
                                {isDownloadingTemplate ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                                {t("downloadTemplate") || "Download Template"}
                            </Button>
                            <BulkUploadInstructions />
                        </div>

                        {/* File Upload Dropzone */}
                        <div>
                            <FileDropzone
                                file={uploadedFile}
                                onFileSelect={setUploadedFile}
                                acceptedTypes={["text/csv", "application/vnd.ms-excel"]}
                                maxSize={10}
                                label={
                                    t("clickOrDragCSVFile") ||
                                    "Click or drag CSV file to upload"
                                }
                            />
                        </div>

                        {/* Upload Button */}
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => navigate("/prospectus")}
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                onClick={handleFileUpload}
                                disabled={!uploadedFile || isProcessing}
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                                {t("uploadAndValidate") || "Upload & Validate"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ──────────── STEP 2: Validation/Backend Errors ──────────── */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                {backendErrors.length > 0
                                    ? t("serverErrorsFound") || "Server Errors Found"
                                    : t("validationErrorsFound") || "Validation Errors Found"}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {backendErrors.length > 0
                                    ? t("fixBackendErrorsAndReupload") ||
                                      "Fix the server errors below and re-upload your corrected CSV file"
                                    : t("fixErrorsAndReupload") ||
                                      "Fix the validation errors below in your CSV file and re-upload"}
                            </p>
                        </div>

                        {/* Summary Alert */}
                        <Alert variant="destructive">
                            <AlertDescription>
                                <div className="flex flex-col gap-1 text-sm">
                                    <p>
                                        <strong>{t("totalErrors") || "Total Errors"}:</strong>{" "}
                                        {backendErrors.length > 0
                                            ? backendErrors.length
                                            : validationErrors.length}
                                    </p>
                                    {backendErrors.length > 0 && (
                                        <p className="text-xs mt-2 font-medium">
                                            ⚠️ {t("backendErrorWarning") ||
                                                "These errors came from the server after attempting to create records"}
                                        </p>
                                    )}
                                    <p className="text-xs mt-2">
                                        {t("pleaseFixAllErrors") ||
                                            "Please fix all errors before uploading again"}
                                    </p>
                                </div>
                            </AlertDescription>
                        </Alert>

                        {/* Errors List */}
                        <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto bg-muted/30">
                            <ul className="space-y-2">
                                {(backendErrors.length > 0
                                    ? backendErrors
                                    : validationErrors
                                ).map((error, index) => (
                                    <li
                                        key={index}
                                        className="text-sm flex items-start gap-2"
                                    >
                                        {error.trim() === "" ? (
                                            <span className="w-full">&nbsp;</span>
                                        ) : error.startsWith("💡") || error.startsWith("   ") ? (
                                            <span className="text-muted-foreground whitespace-pre">
                                                {error}
                                            </span>
                                        ) : (
                                            <>
                                                <span className="text-destructive font-bold">
                                                    •
                                                </span>
                                                <span className="text-destructive">{error}</span>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-between">
                            <Button
                                variant="outline"
                                onClick={handleDownloadErrors}
                            >
                                <Download className="h-4 w-4" />
                                {t("downloadErrors") || "Download Errors"}
                            </Button>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/prospectus")}
                                >
                                    {t("cancel")}
                                </Button>
                                <Button onClick={handleReUpload}>
                                    {t("reUploadFile") || "Re-upload File"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ──────────── STEP 3: Submit Valid Data ──────────── */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                {t("readyToSubmit") || "Ready to Submit"}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {t("reviewSummaryAndSubmit") ||
                                    "Review the summary below and submit to create prospectus records"}
                            </p>
                        </div>

                        {/* Summary */}
                        <Alert>
                            <AlertDescription>
                                <div className="flex flex-col gap-2 text-sm">
                                    <p>
                                        <strong>
                                            {t("totalCompanies") || "Total Companies"}:
                                        </strong>{" "}
                                        {backendPayload?.length || 0}
                                    </p>
                                    <p>
                                        <strong>
                                            {t("totalContacts") || "Total Contacts"}:
                                        </strong>{" "}
                                        {backendPayload?.reduce(
                                            (sum, item) =>
                                                sum + item.prospectuses.length,
                                            0,
                                        ) || 0}
                                    </p>
                                </div>
                            </AlertDescription>
                        </Alert>

                        {/* Preview Table */}
                        <div className="border rounded-lg overflow-x-auto max-h-[400px] overflow-y-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-muted/30">
                                    <TableRow>
                                        <TableHead className="w-[60px]">
                                            {t("row") || "#"}
                                        </TableHead>
                                        <TableHead>{t("company") || "Company"}</TableHead>
                                        <TableHead>
                                            {t("companyPhone") || "Company Phone"}
                                        </TableHead>
                                        <TableHead>
                                            {t("contacts") || "Contacts"}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!backendPayload || backendPayload.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center text-muted-foreground"
                                            >
                                                {t("noData") || "No data"}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        backendPayload.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    {item.company.name || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {item.company.phone?.number || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {item.prospectuses.length} contact(s)
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => navigate("/prospectus")}
                            >
                                {t("cancel")}
                            </Button>
                            <Button variant="outline" onClick={handleReUpload}>
                                {t("startOver") || "Start Over"}
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={
                                    !backendPayload ||
                                    backendPayload.length === 0 ||
                                    isSubmitting
                                }
                            >
                                {isSubmitting && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {t("submitBulkUpload") || "Submit Bulk Upload"}
                            </Button>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    )
}
