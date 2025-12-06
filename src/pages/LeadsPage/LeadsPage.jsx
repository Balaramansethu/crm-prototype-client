import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useLeads } from "@/hooks/useLeads"
import { Loader2 } from "lucide-react"

export default function LeadsPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { data: leads = [], isLoading } = useLeads()

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
             <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">

                {/* HERO HEADER */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">{t("leads")}</h1>
                    <Button onClick={() => navigate("/leads/new")}>{t("createLead")}</Button>
                </div>

                {/* LEADS TABLE */}
                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("contact")}</TableHead>
                                <TableHead>{t("company")}</TableHead>
                                <TableHead>{t("email")}</TableHead>
                                <TableHead>{t("phone")}</TableHead>
                                <TableHead>{t("status")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : leads.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No leads found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leads.map((lead) => (
                                    <TableRow key={lead._id || lead.id}>
                                        <TableCell className="font-medium">{lead.contact}</TableCell>
                                        <TableCell>{lead.company}</TableCell>
                                        <TableCell>{lead.email}</TableCell>
                                        <TableCell>
                                            <span dir="ltr">
                                                {lead.phone?.extension ? `${lead.phone.extension} ` : ""}
                                                {lead.phone?.number}
                                            </span>
                                        </TableCell>
                                        <TableCell>{t(lead.status) || lead.status}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}