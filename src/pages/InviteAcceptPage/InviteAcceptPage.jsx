import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { validateInviteToken } from "@/service/organizationService"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const MAGIC_LINK_STORAGE_KEY = "magicLinkInvite"

export default function InviteAcceptPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    
    const [status, setStatus] = useState("validating") // validating, success, error
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        const validateToken = async () => {
            const token = searchParams.get("token")
            
            if (!token) {
                setStatus("error")
                setErrorMessage(t("inviteInvalid"))
                return
            }

            try {
                const response = await validateInviteToken(token)
                const inviteData = response?.data || response

                if (inviteData?.email) {
                    // Store invite data in localStorage
                    localStorage.setItem(
                        MAGIC_LINK_STORAGE_KEY,
                        JSON.stringify({
                            email: inviteData.email,
                            tenantId: inviteData.tenantId,
                            role: inviteData.role,
                            method: inviteData.method || "viaMagicLink",
                        })
                    )

                    setStatus("success")
                    
                    // Redirect to signup after short delay
                    setTimeout(() => {
                        navigate("/signup", { replace: true })
                    }, 1500)
                } else {
                    setStatus("error")
                    setErrorMessage(t("inviteInvalid"))
                }
            } catch (error) {
                console.error("Failed to validate invite token:", error)
                setStatus("error")
                
                // Check for specific error messages from backend
                const errorMsg = error.response?.data?.message || t("inviteInvalid")
                setErrorMessage(errorMsg)
            }
        }

        validateToken()
    }, [searchParams, navigate, t])

    const handleGoToLogin = () => {
        navigate("/login", { replace: true })
    }

    const handleGoToSignup = () => {
        navigate("/signup", { replace: true })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    {status === "validating" && (
                        <>
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                {t("validatingInvite")}
                            </h2>
                            <p className="text-gray-500">
                                {t("pleaseWait")}
                            </p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                {t("inviteValid")}
                            </h2>
                            <p className="text-gray-500">
                                {t("redirectingToSignup")}
                            </p>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <XCircle className="h-12 w-12 text-red-500 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                {t("inviteError")}
                            </h2>
                            <p className="text-gray-500 mb-6">
                                {errorMessage}
                            </p>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={handleGoToLogin}>
                                    {t("login")}
                                </Button>
                                <Button onClick={handleGoToSignup}>
                                    {t("signup")}
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
