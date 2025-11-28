import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { useTranslation } from "react-i18next"
import { validateSignupFields } from "@/utils/authenticationFieldValidations"

export function SignupForm({ className, onSubmit, loading, ...props }) {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "employee",
    })
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === "ar"

    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.id]: e.target.value })
        setErrors({ ...errors, [e.target.id]: "" })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const validationErrors = validateSignupFields(form)
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        const payload = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.toLowerCase().trim(),
            password: form.password,
            role: form.role,
        }

        onSubmit(payload)
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">
                        {t("createAccount")}
                    </CardTitle>
                    <CardDescription>{t("createAccountDesc")}</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            {/* FIRST NAME */}
                            <Field>
                                <FieldLabel htmlFor="firstName">
                                    {t("firstName")}
                                </FieldLabel>
                                <Input
                                    id="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    placeholder="John"
                                />
                                {errors.firstName && (
                                    <p className="text-red-500 text-sm">
                                        {errors.firstName}
                                    </p>
                                )}
                            </Field>

                            {/* LAST NAME */}
                            <Field>
                                <FieldLabel htmlFor="lastName">
                                    {t("lastName")}
                                </FieldLabel>
                                <Input
                                    id="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                />
                                {errors.lastName && (
                                    <p className="text-red-500 text-sm">
                                        {errors.lastName}
                                    </p>
                                )}
                            </Field>

                            {/* EMAIL */}
                            <Field>
                                <FieldLabel htmlFor="email">
                                    {t("email")}
                                </FieldLabel>
                                <Input
                                    id="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="m@example.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm">
                                        {errors.email}
                                    </p>
                                )}
                            </Field>

                            {/* PASSWORDS */}
                            <Field className="grid grid-cols-2 gap-4">
                                {/* PASSWORD */}
                                <Field>
                                    <FieldLabel htmlFor="password">
                                        {t("password")}
                                    </FieldLabel>

                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={form.password}
                                            onChange={handleChange}
                                            className="pr-10"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((prev) => !prev)
                                            }
                                            className="absolute right-2 top-2.5 text-gray-500 hover:text-black"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>

                                    {errors.password && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.password}
                                        </p>
                                    )}
                                </Field>

                                {/* CONFIRM PASSWORD */}
                                <Field>
                                    <FieldLabel htmlFor="confirmPassword">
                                        {t("confirmPassword")}
                                    </FieldLabel>

                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            className="pr-10"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (prev) => !prev,
                                                )
                                            }
                                            className="absolute right-2 top-2.5 text-gray-500 hover:text-black"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>

                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </Field>
                            </Field>

                            {/* SUBMIT */}
                            <Field>
                                <Button type="submit" disabled={loading}>
                                    {loading
                                        ? t("creatingAccount")
                                        : t("createAccountBtn")}
                                </Button>
                                <FieldDescription>
                                    {t("haveAccount")}{" "}
                                    <Link to="/login">{t("loginLink")}</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
