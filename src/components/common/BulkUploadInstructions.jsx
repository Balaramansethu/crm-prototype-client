import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
    Info,
    CheckCircle2,
    XCircle,
    Users,
    FileSpreadsheet,
    Upload,
    CheckCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function BulkUploadInstructions() {
    const { t, i18n } = useTranslation()
    const [open, setOpen] = useState(false)
    const isRTL = i18n.dir() === "rtl"

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Info className="h-4 w-4" />
                    {t("instructions") || "Instructions"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FileSpreadsheet className="h-5 w-5" />
                        {t("bulkUploadInstructions") ||
                            "Bulk Upload Instructions"}
                    </DialogTitle>
                    <DialogDescription>
                        {t("bulkUploadInstructionsDesc") ||
                            "Complete guide for uploading multiple prospectus records"}
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-rose-50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-rose-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-rose-800 dark:[&::-webkit-scrollbar-track]:bg-rose-950/20 dark:[&::-webkit-scrollbar-thumb]:bg-rose-900 dark:[&::-webkit-scrollbar-thumb]:hover:bg-rose-800">
                    <div className="space-y-6 py-4">
                    {/* ═══════════ OVERVIEW ═══════════ */}
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                            <Info className="h-5 w-5 text-blue-600" />
                            {t("overview") || "Overview"}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {t("bulkUploadOverview") ||
                                "Bulk upload allows you to create multiple company and contact records at once by uploading a CSV file. You can add hundreds of records in a single upload."}
                        </p>
                    </div>

                    <Separator />

                    {/* ═══════════ FORMAT FLEXIBILITY ═══════════ */}
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                            <CheckCheck className="h-5 w-5 text-blue-600" />
                            {t("formatFlexibility") ||
                                "Smart Format Auto-Detection"}
                        </h3>
                        <div className="space-y-3 rounded-lg border bg-blue-50 p-4">
                            <p className="text-sm font-medium text-blue-900">
                                ✨{" "}
                                {t("autoFormatting") ||
                                    "The system automatically handles multiple formats - Excel auto-formatting is fully supported!"}
                            </p>

                            {/* Date Formats */}
                            <div className="mt-3">
                                <p className="text-sm font-semibold text-blue-900 mb-1">
                                    📅{" "}
                                    {t("dateFormats") ||
                                        "Date Formats (all work!)"}
                                </p>
                                <div className="text-xs text-blue-800 space-y-1 ml-4">
                                    <p>
                                        •{" "}
                                        <code className="bg-white px-1 rounded">
                                            2026-03-15
                                        </code>{" "}
                                        (4-digit year, ISO format)
                                    </p>
                                    <p>
                                        •{" "}
                                        <code className="bg-white px-1 rounded">
                                            26-03-15
                                        </code>{" "}
                                        (2-digit year, YY-MM-DD)
                                    </p>
                                    <p>
                                        •{" "}
                                        <code className="bg-white px-1 rounded">
                                            15-03-26
                                        </code>{" "}
                                        (2-digit year, DD-MM-YY) ← Most common
                                        Excel format
                                    </p>
                                    <p>
                                        •{" "}
                                        <code className="bg-white px-1 rounded">
                                            15/03/26
                                        </code>{" "}
                                        (with slashes)
                                    </p>
                                    <p>
                                        •{" "}
                                        <code className="bg-white px-1 rounded">
                                            15-03-2026
                                        </code>{" "}
                                        (4-digit year, DD-MM-YYYY)
                                    </p>
                                    <p className="text-blue-700 font-medium mt-2">
                                        💡 2-digit years (00-99) = 2000-2099
                                        (e.g., 26 = 2026)
                                    </p>
                                </div>
                            </div>

                            {/* Phone Country Codes */}
                            <div className="mt-3">
                                <p className="text-sm font-semibold text-blue-900 mb-1">
                                    📞{" "}
                                    {t("phoneCountryCodes") ||
                                        "Phone Country Codes (auto-formatted)"}
                                </p>
                                <div className="text-xs text-blue-800 space-y-1 ml-4">
                                    <p>
                                        •{" "}
                                        <code className="bg-white px-1 rounded">
                                            966
                                        </code>{" "}
                                        → Auto-formatted to{" "}
                                        <code className="bg-white px-1 rounded">
                                            +966
                                        </code>
                                    </p>
                                    <p>
                                        •{" "}
                                        <code className="bg-white px-1 rounded">
                                            +966
                                        </code>{" "}
                                        → Kept as{" "}
                                        <code className="bg-white px-1 rounded">
                                            +966
                                        </code>
                                    </p>
                                    <p>
                                        •{" "}
                                        <code className="bg-white px-1 rounded">
                                            + 966
                                        </code>{" "}
                                        or{" "}
                                        <code className="bg-white px-1 rounded">
                                            {" "}
                                            966{" "}
                                        </code>{" "}
                                        → Cleaned to{" "}
                                        <code className="bg-white px-1 rounded">
                                            +966
                                        </code>
                                    </p>
                                    <p className="text-blue-700 font-medium mt-2">
                                        💡 Just type the numbers - the + is
                                        added automatically!
                                    </p>
                                </div>
                            </div>

                            {/* Short Address */}
                            <div className="mt-3">
                                <p className="text-sm font-semibold text-blue-900 mb-1">
                                    📍{" "}
                                    {t("shortAddressFormat") ||
                                        "Short Address Format"}
                                </p>
                                <div className="text-xs text-blue-800 space-y-1 ml-4">
                                    <p>
                                        • Must be:{" "}
                                        <strong>
                                            4 uppercase letters + 4 digits
                                        </strong>
                                    </p>
                                    <p>
                                        •{" "}
                                        <code className="bg-white px-1 rounded">
                                            RYDH1234
                                        </code>{" "}
                                        ✓ Correct
                                    </p>
                                    <p>
                                        •{" "}
                                        <code className="bg-white px-1 rounded">
                                            rydh1234
                                        </code>{" "}
                                        → Auto-converted to{" "}
                                        <code className="bg-white px-1 rounded">
                                            RYDH1234
                                        </code>
                                    </p>
                                    <p>
                                        •{" "}
                                        <code className="bg-white px-1 rounded">
                                            RYDH 1234
                                        </code>{" "}
                                        → Spaces removed, becomes{" "}
                                        <code className="bg-white px-1 rounded">
                                            RYDH1234
                                        </code>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* ═══════════ STEP BY STEP FLOW ═══════════ */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">
                            {t("stepByStepGuide") || "Step-by-Step Guide"}
                        </h3>
                        <div className="space-y-4">
                            {/* Step 1 */}
                            <div className="flex gap-3">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                    1
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium mb-1">
                                        {t("downloadTemplateStep") ||
                                            "Download the CSV Template"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t("downloadTemplateStepDesc") ||
                                            "Click 'Download Template' button to get a ready-to-use CSV file with all required columns and sample data."}
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-3">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                    2
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium mb-1">
                                        {t("fillDataStep") ||
                                            "Fill in Your Data"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t("fillDataStepDesc") ||
                                            "Open the template in Excel, Google Sheets, or any spreadsheet software. Delete the sample rows and add your company and contact information."}
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-3">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                    3
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium mb-1">
                                        {t("saveAsCSVStep") || "Save as CSV"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t("saveAsCSVStepDesc") ||
                                            "Save your file as CSV format (not Excel .xlsx). Most spreadsheet apps have 'Save As' or 'Export' option for CSV."}
                                    </p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex gap-3">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                    4
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium mb-1">
                                        {t("uploadFileStep") ||
                                            "Upload Your File"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t("uploadFileStepDesc") ||
                                            "Upload the CSV file. The system will automatically check for errors and show you any issues to fix."}
                                    </p>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="flex gap-3">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                    5
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium mb-1">
                                        {t("submitStep") || "Review and Submit"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t("submitStepDesc") ||
                                            "Review the summary and click 'Submit' to create all records at once."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* ═══════════ MULTIPLE CONTACTS ═══════════ */}
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                            <Users className="h-5 w-5 text-green-600" />
                            {t("addingMultipleContacts") ||
                                "Adding Multiple Contacts"}
                        </h3>
                        <Alert className="mb-3">
                            <AlertDescription className="text-sm">
                                {t("multipleContactsInfo") ||
                                    "To add multiple contacts for the same company, simply repeat the company information in multiple rows with different contact details."}
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                            <p className="text-sm font-medium">
                                {t("exampleLabel") || "Example:"}
                            </p>
                            <div className="rounded-lg border bg-muted/50 p-4 overflow-x-auto">
                                <table className="text-xs w-full border-collapse">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2 font-bold">
                                                Company Name
                                            </th>
                                            <th className="text-left p-2 font-bold">
                                                Company Phone
                                            </th>
                                            <th className="text-left p-2 font-bold">
                                                Contact Name
                                            </th>
                                            <th className="text-left p-2 font-bold">
                                                Contact Email
                                            </th>
                                            <th className="text-left p-2 font-bold">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b bg-blue-50">
                                            <td className="p-2">Acme Corp</td>
                                            <td className="p-2">501234567</td>
                                            <td className="p-2 font-medium">
                                                John Doe
                                            </td>
                                            <td className="p-2">
                                                john@acme.com
                                            </td>
                                            <td className="p-2">new</td>
                                        </tr>
                                        <tr className="border-b bg-blue-50">
                                            <td className="p-2">Acme Corp</td>
                                            <td className="p-2">501234567</td>
                                            <td className="p-2 font-medium">
                                                Jane Smith
                                            </td>
                                            <td className="p-2">
                                                jane@acme.com
                                            </td>
                                            <td className="p-2">qualified</td>
                                        </tr>
                                        <tr className="bg-blue-50">
                                            <td className="p-2">Acme Corp</td>
                                            <td className="p-2">501234567</td>
                                            <td className="p-2 font-medium">
                                                Bob Wilson
                                            </td>
                                            <td className="p-2">
                                                bob@acme.com
                                            </td>
                                            <td className="p-2">new</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-sm text-muted-foreground italic">
                                {t("multipleContactsResult") ||
                                    "↑ This will create ONE company (Acme Corp) with THREE contacts (John, Jane, and Bob)"}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* ═══════════ DO'S ═══════════ */}
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            {t("dos") || "Do's"} ✓
                        </h3>
                        <ul className="space-y-2">
                            {[
                                t("do1") ||
                                    "Keep the header row (first row) unchanged - do not modify column names",
                                t("do2") ||
                                    "Delete the sample data rows (rows 2 and 3) before adding your real data",
                                t("do3") ||
                                    "Fill in at least Company Name and Company Phone Number - these are the only required fields",
                                t("do4") ||
                                    "Use the same Company Name and Phone Number in multiple rows to add multiple contacts to one company",
                                t("do5") ||
                                    "Let Excel auto-format dates - all common formats work (15-03-26, 15/03/26, 2026-03-15, etc.)",
                                t("do6") ||
                                    "For phone country codes, just type numbers (966) - the + is added automatically",
                                t("do7") ||
                                    "Save the file as CSV format (.csv) before uploading - not Excel (.xlsx)",
                                t("do8") ||
                                    "Download error reports if you get errors - they include step-by-step fix instructions",
                                t("do9") ||
                                    "Test with 2-3 rows first before uploading hundreds of records",
                            ].map((item, index) => (
                                <li key={index} className="flex gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Separator />

                    {/* ═══════════ DON'TS ═══════════ */}
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                            <XCircle className="h-5 w-5 text-red-600" />
                            {t("donts") || "Don'ts"} ✗
                        </h3>
                        <ul className="space-y-2">
                            {[
                                t("dont1") ||
                                    "Don't modify, rename, or delete the header row column names",
                                t("dont2") ||
                                    "Don't leave Company Name or Company Phone Number empty - they're required",
                                t("dont3") ||
                                    "Don't use spaces, dashes, or brackets in phone numbers (use 501234567, not 50-123-4567)",
                                t("dont4") ||
                                    "Don't save the file as Excel (.xlsx) - must be saved as CSV (.csv)",
                                t("dont5") ||
                                    "Don't use text-based dates like 'March 15, 2025' or '15th Mar' - use numbers only",
                                t("dont6") ||
                                    "Don't worry about exact date format - Excel auto-formatting is supported (15-03-26, 15/03/26, all work)",
                                t("dont7") ||
                                    "Don't upload files larger than 10 MB - split into multiple files if needed",
                                t("dont8") ||
                                    "Don't add records that already exist in the system - you'll get duplicate errors",
                                t("dont9") ||
                                    "Don't manually type + for country codes - just type numbers (system adds + automatically)",
                            ].map((item, index) => (
                                <li key={index} className="flex gap-2 text-sm">
                                    <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Separator />

                    {/* ═══════════ REQUIRED FIELDS ═══════════ */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">
                            {t("requiredFields") || "Required Fields"}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="rounded-lg border bg-red-50 p-3">
                                <p className="font-medium text-sm text-red-900 mb-1">
                                    Company Name
                                </p>
                                <p className="text-xs text-red-700">
                                    {t("companyNameReq") ||
                                        "2-100 characters, must be unique"}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-red-50 p-3">
                                <p className="font-medium text-sm text-red-900 mb-1">
                                    Company Phone Number
                                </p>
                                <p className="text-xs text-red-700">
                                    {t("companyPhoneReq") ||
                                        "8-15 digits, numbers only, must be unique"}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {t("allOtherFieldsOptional") ||
                                "All other fields are optional"}
                        </p>
                    </div>

                    <Separator />

                    {/* ═══════════ COMMON MISTAKES ═══════════ */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">
                            {t("commonMistakes") || "Common Mistakes to Avoid"}
                        </h3>
                        <div className="space-y-2">
                            <Alert variant="destructive">
                                <AlertDescription className="text-sm">
                                    <strong>
                                        {t("mistake1Title") || "Wrong:"}
                                    </strong>{" "}
                                    {t("mistake1") ||
                                        "Saving as Excel (.xlsx) instead of CSV (.csv)"}
                                </AlertDescription>
                            </Alert>
                            <Alert variant="destructive">
                                <AlertDescription className="text-sm">
                                    <strong>
                                        {t("mistake2Title") || "Wrong:"}
                                    </strong>{" "}
                                    {t("mistake2") ||
                                        "Text dates like 'March 15, 2025' or '15th Mar'"}
                                    <br />
                                    <strong>
                                        {t("correctLabel") || "Correct:"}
                                    </strong>{" "}
                                    2025-03-15, 25-03-15, 15-03-25, 15/03/25
                                    (all work!)
                                </AlertDescription>
                            </Alert>
                            <Alert variant="destructive">
                                <AlertDescription className="text-sm">
                                    <strong>
                                        {t("mistake3Title") || "Wrong:"}
                                    </strong>{" "}
                                    {t("mistake3") ||
                                        "Phone with spaces: 50 123 4567"}
                                    <br />
                                    <strong>
                                        {t("correctLabel") || "Correct:"}
                                    </strong>{" "}
                                    501234567
                                </AlertDescription>
                            </Alert>
                            <Alert variant="destructive">
                                <AlertDescription className="text-sm">
                                    <strong>
                                        {t("mistake4Title") || "Wrong:"}
                                    </strong>{" "}
                                    {t("mistake4") ||
                                        "Changing column header names"}
                                    <br />
                                    <strong>
                                        {t("correctLabel") || "Correct:"}
                                    </strong>{" "}
                                    {t("keepHeadersUnchanged") ||
                                        "Keep headers exactly as in template"}
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>

                    <Separator />

                    {/* ═══════════ TIPS ═══════════ */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">
                            {t("proTips") || "Pro Tips"} 💡
                        </h3>
                        <ul className="space-y-2">
                            {[
                                t("tip1") ||
                                    "Start with 2-3 test rows before uploading your full data",
                                t("tip2") ||
                                    "Keep a backup copy of your CSV file before uploading",
                                t("tip3") ||
                                    "If you get errors, download the error report - it includes helpful tips on how to fix each issue",
                                t("tip4") ||
                                    "Don't worry about date formats - Excel auto-formatting works! The system handles multiple date formats automatically",
                                t("tip5") ||
                                    "Phone country codes: Just type numbers (966) - the system adds the + automatically",
                                t("tip6") ||
                                    "You can leave optional fields empty - only Company Name and Phone are required",
                                t("tip7") ||
                                    "Use the template's sample rows as a reference for formatting",
                                t("tip8") ||
                                    "If backend errors occur (duplicates, etc.), you'll see them with fix instructions - just correct your CSV and re-upload",
                            ].map((item, index) => (
                                <li key={index} className="flex gap-2 text-sm">
                                    <span className="text-yellow-600 font-bold shrink-0">
                                        💡
                                    </span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ═══════════ CLOSE BUTTON ═══════════ */}
                    <div className="flex justify-end pt-4">
                        <Button onClick={() => setOpen(false)}>
                            {t("gotIt") || "Got It!"}
                        </Button>
                    </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
