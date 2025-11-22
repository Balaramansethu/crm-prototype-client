import { http, HttpResponse } from "msw"

export const authHandlers = [
    // GET /auth/me
    http.get("/api/auth/me", () => {
        const data = localStorage.getItem("mockUser")

        if (!data) {
            return HttpResponse.json(
                { error: "Not authenticated" },
                { status: 401 },
            )
        }

        return HttpResponse.json(JSON.parse(data))
    }),

    // POST /auth/login
    http.post("/api/auth/login", async ({ request }) => {
        const body = await request.json()

        if (body.email === "test@example.com" && body.password === "123456") {
            const user = {
                name: "Test User",
                email: body.email,
                role: "admin",
                id: "user-123",
            }

            localStorage.setItem("mockUser", JSON.stringify(user))
            return HttpResponse.json(user)
        }

        return HttpResponse.json(
            { message: "Invalid credentials" },
            { status: 401 },
        )
    }),

    // POST /auth/signup
    http.post("/api/auth/signup", async ({ request }) => {
        const body = await request.json()

        const newUser = {
            name: body.name,
            email: body.email,
            role: "admin",
            id: "user-123",
        }

        localStorage.setItem("mockUser", JSON.stringify(newUser))
        return HttpResponse.json(newUser)
    }),

    // GET /auth/logout
    http.get("/api/auth/logout", () => {
        localStorage.removeItem("mockUser")
        return HttpResponse.json({ success: true })
    }),
]
