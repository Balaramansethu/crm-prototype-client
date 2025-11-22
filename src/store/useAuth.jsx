import { create } from "zustand"

export const useAuthStore = create((set) => ({
    step: 1,
    email: "",
    isAuthenticated: false,

    setEmail: (email) => set({ email }),
    nextStep: () => set((state) => ({ step: state.step + 1 })),
    prevStep: () => set((state) => ({ step: state.step - 1 })),
    setAuthenticated: (value) => set({ isAuthenticated: value }),
}))
