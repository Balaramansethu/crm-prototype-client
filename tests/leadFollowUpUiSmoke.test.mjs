process.env.TZ = "Asia/Kolkata"

import { test } from "node:test"
import assert from "node:assert/strict"
import { fileURLToPath } from "node:url"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import i18next from "i18next"
import { I18nextProvider } from "react-i18next"
import { createServer } from "vite"
import { format } from "date-fns"
import {
    transformLeadPayload,
    transformLeadUpdatePayload,
} from "../src/utils/leadTransformers.js"

const picked = new Date(2026, 2, 15)

const testI18n = i18next.createInstance()
await testI18n.init({
    lng: "en",
    resources: { en: { translation: {} } },
})

const form = (followUp) => ({
    companyDetails: { name: "Acme" },
    contacts: [{ name: "Sara", followUp }],
})

const saveFourTimes = () => {
    let stored = transformLeadPayload(form(picked), "owner-1").leads[0]
        .followUp

    for (let save = 1; save <= 4; save++) {
        stored = transformLeadUpdatePayload(
            form(new Date(stored)),
            0,
        ).followUp
    }

    return stored
}

const renderWithProviders = (element, queryClient) =>
    renderToStaticMarkup(
        React.createElement(
            I18nextProvider,
            { i18n: testI18n },
            React.createElement(
                QueryClientProvider,
                { client: queryClient },
                React.createElement(
                    MemoryRouter,
                    { initialEntries: ["/leads"] },
                    element,
                ),
            ),
        ),
    )

test("renders the persisted follow-up in the actual lead list and detail paths", async () => {
    const stored = saveFourTimes()
    assert.equal(stored, picked.toISOString())

    const lead = {
        _id: "lead-1",
        contact: { name: "Sara" },
        status: "new",
        followUp: stored,
        priority: 1,
    }
    const responseData = {
        company: { _id: "company-1", name: "Acme" },
        leads: [lead],
        info: { total: 1, totalPages: 1 },
    }
    const listQueryParams = {
        page: 1,
        limit: 10,
        sort: "createdAt",
        order: "desc",
        contact: "",
        company: "",
        owner: undefined,
        status: "",
        followUp: "",
    }
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    queryClient.setQueryData(["leads", listQueryParams], {
        leads: [responseData],
        info: responseData.info,
    })

    const detailFixture = JSON.stringify(responseData)
    const detailFixturePlugin = {
        name: "lead-follow-up-detail-fixture",
        enforce: "pre",
        transform(source, id) {
            if (!id.endsWith("/src/pages/LeadsPage/LeadDetailPage.jsx")) {
                return null
            }

            return source
                .replace(
                    "const [leadData, setLeadData] = useState(null)",
                    `const [leadData, setLeadData] = useState(${detailFixture})`,
                )
                .replace(
                    "const [loading, setLoading] = useState(true)",
                    "const [loading, setLoading] = useState(false)",
                )
        },
    }

    const viteServer = await createServer({
        configFile: fileURLToPath(new URL("../vite.config.js", import.meta.url)),
        plugins: [detailFixturePlugin],
        server: { middlewareMode: true },
        appType: "custom",
        logLevel: "error",
    })

    try {
        const { default: LeadsPage } = await viteServer.ssrLoadModule(
            "/src/pages/LeadsPage/LeadsPage.jsx",
        )
        const { default: LeadDetailPage } = await viteServer.ssrLoadModule(
            "/src/pages/LeadsPage/LeadDetailPage.jsx",
        )

        const listMarkup = renderWithProviders(
            React.createElement(LeadsPage),
            queryClient,
        )
        const detailMarkup = renderWithProviders(
            React.createElement(LeadDetailPage),
            queryClient,
        )

        assert.match(listMarkup, />15-03-2026</)
        assert.match(detailMarkup, />15 Mar 2026</)
        assert.equal(format(new Date(stored), "dd-MM-yyyy"), "15-03-2026")
        assert.equal(format(new Date(stored), "dd MMM yyyy"), "15 Mar 2026")
    } finally {
        await viteServer.close()
    }
})
