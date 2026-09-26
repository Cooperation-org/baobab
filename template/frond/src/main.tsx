import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { NAV_SRC, THEME_CSS } from "@/config"
import { routeTree } from "./routeTree.gen"
import "./index.css"

if (NAV_SRC) {
  const script = document.createElement("script")
  script.src = NAV_SRC
  document.head.append(script)
}

if (THEME_CSS) {
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = THEME_CSS
  document.head.append(link)
}

const queryClient = new QueryClient()
const router = createRouter({ routeTree, defaultPreload: "intent" })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)
