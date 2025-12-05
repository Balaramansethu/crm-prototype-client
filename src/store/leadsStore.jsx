import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useLeadsStore = create(
    persist(
        (set) => ({
            leads: [
                {
                    id: 1,
                    name: "Christopher Maclead",
                    company: "Rangoni Of Florence",
                    email: "christopher@example.com",
                    phone: "555-555-5555",
                },
            ],

            setLeads: (leads) => set({ leads }),
            
            addLead: (lead) =>
                set((state) => ({
                    leads: [...state.leads, { ...lead, id: state.leads.length + 1 }],
                })),
        }),
        {
            name: "crm-leads",
            getStorage: () => sessionStorage, // or localStorage if you prefer persistence across sessions
        },
    ),
)
