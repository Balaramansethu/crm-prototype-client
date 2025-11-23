import { useState } from "react"
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
import { validateLoginFields } from "@/utils/authenticationFieldValidations"

export function LoginForm({ onSubmit, loading, className, ...props }) {
    const [form, setForm] = useState({
        email: "",
        password: "",
    })

    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        setForm({ ...form, [e.target.id]: e.target.value })
        setErrors({ ...errors, [e.target.id]: "" })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const validationErrors = validateLoginFields(form)
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        const payload = {
            email: form.email.toLowerCase().trim(),
            password: form.password,
        }

        onSubmit(payload)
    }

    return (
        <div className={className} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access CRM
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            {/* EMAIL */}
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
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

                            {/* PASSWORD */}
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

                            {/* SUBMIT */}
                            <Field>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Logging in..." : "Login"}
                                </Button>
                                <FieldDescription>
                                    Don't have an account?{" "}
                                    <Link to="/signup">Signup</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
