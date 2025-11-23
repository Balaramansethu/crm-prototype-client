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

    const [errors, setErrors] = useState({})

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
                        Create your account
                    </CardTitle>
                    <CardDescription>
                        Fill the form to register into CRM
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            {/* FIRST NAME */}
                            <Field>
                                <FieldLabel htmlFor="firstName">
                                    First Name
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
                                    Last Name
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
                                <FieldLabel htmlFor="email">Email</FieldLabel>
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
                                <Field>
                                    <FieldLabel htmlFor="password">
                                        Password
                                    </FieldLabel>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={form.password}
                                        onChange={handleChange}
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-sm">
                                            {errors.password}
                                        </p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="confirmPassword">
                                        Confirm Password
                                    </FieldLabel>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-sm">
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </Field>
                            </Field>

                            {/* SUBMIT */}
                            <Field>
                                <Button type="submit" disabled={loading}>
                                    {loading
                                        ? "Creating Account..."
                                        : "Create Account"}
                                </Button>
                                <FieldDescription>
                                    Have an account?{" "}
                                    <Link to="/login">Login</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
