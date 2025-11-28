import {
    AUTH_ERROR_CODES,
    ERROR_CODES,
    ERROR_MESSAGES,
    FIELD_ERROR_CODES,
} from "@/constants/errorConstants.js"
import { toast } from "sonner"

export class ErrorHandler {
    static handleError(error, navigate, options = {}) {
        const {
            showToast = true,
            setFieldErrors = null,
            customRedirect = null,
        } = options

        const errorData = error?.response?.data
        const errorCode = errorData?.errorCode
        const errorMessage =
            errorData?.message ||
            ERROR_MESSAGES[errorCode] ||
            "Something went wrong"

        const errorType = errorData?.error
        const statusCode = error?.response?.status

        // Network error
        if (this.isNetworkError(error)) {
            return this.handleNetworkError(showToast)
        }

        // Auth error (409)
        if (AUTH_ERROR_CODES.includes(errorCode)) {
            return this.handleAuthError(
                errorMessage,
                navigate,
                showToast,
                customRedirect,
            )
        }

        // Conflict (409)
        if (statusCode === 409) {
            if (showToast) {
                toast.error(errorMessage, {
                    description: "Try Login or use another email to proceed",
                    duration: 3000,
                })
            }

            return { type: "conflict_error", handled: true }
        }

        // Auth error (401)
        if (AUTH_ERROR_CODES.includes(errorCode) || statusCode === 401) {
            return this.handleAuthError(
                errorMessage,
                navigate,
                showToast,
                customRedirect,
            )
        }

        // Forbidden (403)
        if (
            errorCode === ERROR_CODES.INSUFFICIENT_PERMISSIONS ||
            statusCode === 403
        ) {
            return this.handleForbiddenError(errorMessage, navigate, showToast)
        }

        // Field validation errors
        if (FIELD_ERROR_CODES.includes(errorCode)) {
            return this.handleFieldError(
                errorCode,
                errorMessage,
                errorType,
                setFieldErrors,
            )
        }

        // General error toast
        if (showToast) {
            toast.error(errorMessage, {
                description:
                    errorType === "server_error"
                        ? "Please try again later"
                        : undefined,
                duration: 4000,
            })
        }

        return { type: "general_error", errorCode, message: errorMessage }
    }

    // --- AUTH ERROR (401)
    static handleAuthError(errorMessage, navigate, showToast, customRedirect) {
        if (showToast) {
            toast.error(errorMessage, {
                description: "Please try again",
                duration: 2000,
            })
        }

        setTimeout(() => {
            localStorage.removeItem("user")
            navigate(customRedirect || "/login", { replace: true })
        }, 1000)

        return { type: "auth_redirect", handled: true }
    }

    // --- FORBIDDEN (403)
    static handleForbiddenError(errorMessage, navigate, showToast) {
        if (showToast) {
            toast.error(errorMessage, {
                description: "You'll be redirected back",
                duration: 3000,
            })
        }

        setTimeout(() => navigate("/dashboard", { replace: true }), 1500)
        return { type: "forbidden", handled: true }
    }

    // --- FIELD VALIDATION ERROR (NO TOAST)
    static handleFieldError(
        errorCode,
        errorMessage,
        errorType,
        setFieldErrors,
    ) {
        const fieldName = this.mapErrorToField(errorCode, errorType)

        if (fieldName && setFieldErrors) {
            setFieldErrors((prev) => ({
                ...prev,
                [fieldName]: errorMessage,
            }))
        }

        return {
            type: "field_error",
            fieldName,
            message: errorMessage,
        }
    }

    // --- NETWORK ERROR
    static handleNetworkError(showToast) {
        if (showToast) {
            toast.error("Network Error", {
                description: "Please check your internet connection",
                duration: 4000,
            })
        }
        return { type: "network_error", handled: true }
    }

    // --- MAP ERROR CODE → FIELD
    static mapErrorToField(errorCode, errorType) {
        const codeMapping = {
            [ERROR_CODES.INVALID_EMAIL_FORMAT]: "email",
            [ERROR_CODES.EMAIL_ALREADY_EXISTS]: "email",
            [ERROR_CODES.INVALID_EMAIL]: "email",
            [ERROR_CODES.INVALID_PASSWORD_FORMAT]: "password",
            [ERROR_CODES.INVALID_PASSWORD]: "password",
            [ERROR_CODES.INVALID_CREDENTIALS]: "password",
        }

        const typeMapping = {
            invalid_email: "email",
            email_exists: "email",
            invalid_password: "password",
        }

        return codeMapping[errorCode] || typeMapping[errorType]
    }

    static isNetworkError(error) {
        return !error.response && error.request
    }
}
