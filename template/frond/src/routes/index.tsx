import { useQuery } from "@tanstack/react-query"
import { Link, Navigate, createFileRoute } from "@tanstack/react-router"
import { getJSON } from "@/api"

type Me = { name: string; orgs: { slug: string; name: string }[] }

export const Route = createFileRoute("/")({ component: Orgs })

function Orgs() {
  const me = useQuery({ queryKey: ["me"], queryFn: () => getJSON<Me>("/api/me/") })

  if (me.isPending) return null
  if (me.isError) return <p className="text-destructive">Could not load your orgs.</p>
  if (me.data.orgs.length === 1) {
    return <Navigate to="/o/$org" params={{ org: me.data.orgs[0].slug }} />
  }
  if (me.data.orgs.length === 0) {
    return <p className="text-muted-foreground">You are not in an org yet.</p>
  }
  return (
    <ul className="divide-y">
      {me.data.orgs.map((o) => (
        <li key={o.slug} className="py-2">
          <Link to="/o/$org" params={{ org: o.slug }}>{o.name}</Link>
        </li>
      ))}
    </ul>
  )
}
