import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTranslation } from "react-i18next"
import { useLeadsStore } from "@/store/leadsStore"
import { useNavigate } from "react-router-dom"

export default function LeadsPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const leads = useLeadsStore((state) => state.leads)

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
                                <TableHead>{t("leadName")}</TableHead>
                                <TableHead>{t("company")}</TableHead>
                                <TableHead>{t("email")}</TableHead>
                                <TableHead>{t("phone")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leads.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell>{lead.name}</TableCell>
                                    <TableCell>{lead.company}</TableCell>
                                    <TableCell>{lead.email}</TableCell>
                                    <TableCell>{lead.phone}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
