import { useState, Fragment } from "react"
import { GalleryVerticalEnd, Mail, Link as LinkIcon, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldDescription,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export default function OrganizationRegisterPage() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        email: "",
        orgName: "",
        password: "",
        inviteEmail: ""
    })
    const navigate = useNavigate()

    const handleInputChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleNextStep1 = (e) => {
        e.preventDefault()
        if (!formData.email || !formData.email.includes("@")) {
            toast.error("Please enter a valid email address.")
            return
        }
        setStep(2)
    }

    const handleRegisterStep2 = (e) => {
        e.preventDefault()
        if (!formData.orgName || !formData.password) {
            toast.error("Please fill in all fields.")
            return
        }
        // Simulate registration API call
        toast.success("Organization registered successfully!")
        setStep(3)
    }

    const handleInviteStep3 = (e) => {
        e.preventDefault()
        if (formData.inviteEmail && !formData.inviteEmail.includes("@")) {
             toast.error("Please enter a valid email for invitation.")
             return
        }
        
        // Simulate sending magic link
        if (formData.inviteEmail) {
            toast.success(`Magic link sent to ${formData.inviteEmail}`)
        } else {
             toast.info("Skipping invitation for now.")
        }
        // Navigate to dashboard or login
        navigate("/login")
    }

    return (
        <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-white p-6 md:p-10">
            {/* Professional Background Pattern */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            
            <div className="flex w-full max-w-md flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
                <a href="#" className="flex items-center gap-2 self-center font-medium transition-transform hover:scale-105">
                    <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    Acme Inc.
                </a>
                <div className={cn("flex flex-col gap-6", "bg-card/50 backdrop-blur-sm p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all")}>
                    
                    {/* Visual Stepper Indicator */}
                    <div className="flex items-center w-full mb-2 px-2">
                        {[1, 2, 3].map((s) => (
                            <Fragment key={s}>
                                <div className={cn(
                                    "flex shrink-0 size-8 items-center justify-center rounded-full border text-xs font-medium transition-all duration-300",
                                    step === s ? "bg-primary text-primary-foreground border-primary scale-110 shadow-sm" : 
                                    step > s ? "bg-primary/20 text-primary border-primary/20" : "bg-muted text-muted-foreground"
                                )}>
                                    {step > s ? <Check className="size-4" /> : s}
                                </div>
                                {s < 3 && <div className={cn("h-[2px] flex-1 mx-2 rounded-full transition-all duration-500", step > s ? "bg-primary/20" : "bg-muted")} />}
                            </Fragment>
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-2 text-center animate-in slide-in-from-bottom-2 duration-300">
                        <h1 className="text-xl font-bold tracking-tight">
                            {step === 1 && "Register Organization"}
                            {step === 2 && "Organization Details"}
                            {step === 3 && "Invite Members"}
                        </h1>
                        <FieldDescription className="text-balance">
                            {step === 1 && "Start by entering your organization email."}
                            {step === 2 && "Set up your organization profile."}
                            {step === 3 && "Invite your team to collaborate."}
                        </FieldDescription>
                    </div>

                    {/* Step 1: Email */}
                    {step === 1 && (
                        <form onSubmit={handleNextStep1} className="animate-in fade-in slide-in-from-right-4 duration-300" autoComplete="off">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="email">Organization Email</FieldLabel>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        placeholder="org@example.com" 
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required 
                                        autoFocus
                                        autoComplete="off"
                                        className="bg-background/50"
                                    />
                                </Field>
                                <Button type="submit" className="w-full shadow-sm hover:shadow transition-all">
                                    Next Step
                                </Button>
                            </FieldGroup>
                        </form>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                        <form onSubmit={handleRegisterStep2} className="animate-in fade-in slide-in-from-right-4 duration-300" autoComplete="off">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="email-frozen">Email</FieldLabel>
                                    <Input 
                                        id="email-frozen" 
                                        type="email" 
                                        value={formData.email} 
                                        disabled 
                                        className="bg-muted text-muted-foreground opacity-100 cursor-not-allowed"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="orgName">Organization Name</FieldLabel>
                                    <Input 
                                        id="orgName" 
                                        type="text" 
                                        placeholder="Acme Corp" 
                                        value={formData.orgName}
                                        onChange={handleInputChange}
                                        required 
                                        autoFocus
                                        autoComplete="off"
                                        className="bg-background/50"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required 
                                        autoComplete="new-password"
                                        className="bg-background/50"
                                    />
                                </Field>
                                <div className="flex gap-3 pt-2">
                                     <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                                        Back
                                    </Button>
                                    <Button type="submit" className="flex-1 shadow-sm hover:shadow transition-all">
                                        Register
                                    </Button>
                                </div>
                            </FieldGroup>
                        </form>
                    )}

                    {/* Step 3: Invite */}
                    {step === 3 && (
                        <form onSubmit={handleInviteStep3} className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <FieldGroup>
                                <div className="p-6 bg-primary/5 rounded-xl border border-primary/10 text-center space-y-2 mb-2">
                                    <div className="mx-auto size-12 bg-white rounded-full flex items-center justify-center shadow-sm text-primary mb-3">
                                        <LinkIcon className="size-6" />
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">Magic Link Invitation</p>
                                    <p className="text-xs text-muted-foreground text-balance">Send a magic link to your team members to allow them to join your organization instantly.</p>
                                </div>
                                <Field>
                                    <FieldLabel htmlFor="inviteEmail">Team Member Email</FieldLabel>
                                    <Input 
                                        id="inviteEmail" 
                                        type="email" 
                                        placeholder="colleague@example.com" 
                                        value={formData.inviteEmail}
                                        onChange={handleInputChange}
                                        className="bg-background/50"
                                    />
                                </Field>
                                <Button type="submit" className="w-full shadow-sm hover:shadow transition-all">
                                    {formData.inviteEmail ? "Send Invite & Finish" : "Skip & Finish"}
                                </Button>
                            </FieldGroup>
                        </form>
                    )}
                </div>
                <FieldDescription className="text-center text-xs">
                    Already have an account? <a href="/login" className="text-primary hover:underline font-medium">Login</a>
                </FieldDescription>
            </div>
        </div>
    )
}
