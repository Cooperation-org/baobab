import type { ElementType } from "react"
import { Outlet, createRootRoute } from "@tanstack/react-router"
import { APP_NAME, NAV_SRC, NAV_TAG } from "@/config"

const Nav = NAV_TAG as ElementType

export const Route = createRootRoute({ component: Shell })

function Shell() {
  return (
    <>
      {NAV_SRC ? (
        <Nav />
      ) : (
        <header className="border-b px-4 py-3 font-heading text-lg">
          {APP_NAME}
        </header>
      )}
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </>
  )
}
