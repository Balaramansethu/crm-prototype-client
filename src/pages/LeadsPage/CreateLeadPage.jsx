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
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { useLeadsStore } from "@/store/leadsStore"
import { useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react" // Or any icon you prefer for breadcrumbs

export default function CreateLeadPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const addLead = useLeadsStore((state) => state.addLead)

    const form = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            company: "",
            email: "",
            phone: "",
        },
    })

    const onSubmit = (data) => {
        addLead({
            name: `${data.firstName} ${data.lastName}`,
            company: data.company,
            email: data.email,
            phone: data.phone,
        })
        navigate("/leads")
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
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    rules={{
                                        required: "First name is required",
                                        minLength: {
                                            value: 2,
                                            message: "Must be at least 2 chars",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("firstName")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder={t("firstNamePlaceholder")} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    rules={{
                                        required: "Last name is required",
                                        minLength: {
                                            value: 2,
                                            message: "Must be at least 2 chars",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("lastName")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder={t("lastNamePlaceholder")} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

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

                            <FormField
                                control={form.control}
                                name="phone"
                                rules={{
                                    required: "Phone number is required",
                                    minLength: {
                                        value: 10,
                                        message: "Must be at least 10 digits",
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

                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="button" variant="outline" onClick={() => navigate("/leads")}>
                                    {t("cancel") || "Cancel"}
                                </Button>
                                <Button type="submit">{t("saveLead")}</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}
