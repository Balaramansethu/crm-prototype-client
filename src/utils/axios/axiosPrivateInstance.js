import axios from "axios"
import { toast } from "sonner"
import { BASE_URL } from "@/constants/endpoint"
import { useUserStore } from "@/store/userStore"

const axiosPrivateInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
})

axiosPrivateInstance.interceptors.request.use(
    (config) => {
        const token = useUserStore.getState().user?.accessToken
        if (token) config.headers["Authorization"] = `Bearer ${token}`
        return config
    },
    (error) => Promise.reject(error),
)

axiosPrivateInstance.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalReq = error.config

        // Token expired
        if (error.response?.data?.errorCode === "2003" && !originalReq._retry) {
            originalReq._retry = true

            try {
                // request new token
                const refreshRes = await axios.post(
                    BASE_URL + "/auth/refresh",
                    {},
                    { withCredentials: true }
                )

                const newToken = refreshRes.data?.accessToken

                if (!newToken) throw new Error("No new token returned")

                // update Zustand user
                const store = useUserStore.getState()
                store.setUser({
                    ...store.user,
                    accessToken: newToken,
                })

                // retry original request WITH NEW TOKEN
                originalReq.headers["Authorization"] = `Bearer ${newToken}`

                return axiosPrivateInstance(originalReq)
            } catch (err) {
                toast.error("Session expired, please login to continue.")
                useUserStore.getState().clearUser()
                window.location.href = "/login"
            }
        }

        return Promise.reject(error)
    }
)


export { axiosPrivateInstance }
