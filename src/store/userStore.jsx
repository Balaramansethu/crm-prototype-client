import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useUserStore = create(
    persist(
        (set) => ({
            user: null,
            isSessionExpired: false,

            setUser: (user) => set({ user }),
            setSessionExpired: (status) => set({ isSessionExpired: status }),
            clearUser: () => {
                set({ user: null, isSessionExpired: false })
                sessionStorage.removeItem("crm-user")
                localStorage.removeItem("user")
            },
        }),
        {
            name: "crm-user",
            getStorage: () => sessionStorage,
        },
    ),
)
