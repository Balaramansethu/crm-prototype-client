import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useUserStore = create(
    persist(
        (set) => ({
            user: null,

            setUser: (user) => set({ user }),
            clearUser: () => {
                set({ user: null })
                sessionStorage.removeItem("crm-user")
            },
        }),
        {
            name: "crm-user",
            getStorage: () => sessionStorage,
        },
    ),
)
