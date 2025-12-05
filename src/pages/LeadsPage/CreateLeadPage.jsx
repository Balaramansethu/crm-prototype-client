import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { CalendarIcon, ChevronRight, Loader2 } from "lucide-react"
import { createLead } from "@/service/leadsService"
import { useUserStore } from "@/store/userStore"
import { toast } from "sonner"
import { useState } from "react"

export default function CreateLeadPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const user = useUserStore((state) => state.user)
    const [loading, setLoading] = useState(false)

    const form = useForm({
        defaultValues: {
            company: "",
            contact: "",
            phoneExtension: "",
            phoneNumber: "",
            email: "",
            status: "new",
            source: "",
            followUp: undefined,
        },
    })

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const payload = {
                company: data.company,
                contact: data.contact,
                phone: {
                    extension: data.phoneExtension,
                    number: data.phoneNumber,
                },
                email: data.email,
                status: data.status,
                source: data.source,
                followUp: data.followUp ? new Date(data.followUp).toISOString() : null,
                owner: user?._id || user?.id,
            }

            await createLead(payload)
            toast.success(t("leadCreatedSuccess") || "Lead created successfully")
            navigate("/leads")
        } catch (error) {
            console.error(error)
            const message = error?.response?.data?.message || t("somethingWrong") || "Something went wrong"
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                
                {/* HEADER / BREADCRUMB-LIKE */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <span className="hover:text-foreground cursor-pointer" onClick={() => navigate("/leads")}>{t("leads")}</span>
                     <ChevronRight className="h-4 w-4" />
                     <span className="text-foreground font-medium">{t("createLead")}</span>
                </div>

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">{t("createLead")}</h1>
                </div>

                <div className="rounded-md border bg-white p-6 max-w-2xl">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="grid gap-6"
                        >
                            {/* Contact Name */}
                            <FormField
                                control={form.control}
                                name="contact"
                                rules={{ required: "Contact name is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("contact")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Company */}
                            <FormField
                                control={form.control}
                                name="company"
                                rules={{ required: "Company name is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("company")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                rules={{
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address",
                                    },
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("email")}</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} placeholder={t("emailPlaceholder")} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Phone (Extension + Number) */}
                            <div className="grid grid-cols-[100px_1fr] gap-4">
                                <FormField
                                    control={form.control}
                                    name="phoneExtension"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("extension")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="+966" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    rules={{
                                        required: "Phone number is required",
                                        minLength: {
                                            value: 8,
                                            message: "Too short",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("phone")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Status and Source */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("status")}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t("selectStatus")} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="new">{t("new")}</SelectItem>
                                                    <SelectItem value="contacted">{t("contacted")}</SelectItem>
                                                    <SelectItem value="qualified">{t("qualified")}</SelectItem>
                                                    <SelectItem value="lost">{t("lost")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="source"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("source")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="e.g. Website, Exhibition" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Follow Up Date (Shadcn DatePicker) */}
                            <FormField
                                control={form.control}
                                name="followUp"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{t("followUp")}</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="button" variant="outline" onClick={() => navigate("/leads")}>
                                    {t("cancel") || "Cancel"}
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t("saveLead")}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}
