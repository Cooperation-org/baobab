import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { getJSON } from "@/api"

type Item = { id: number; title: string }

export const Route = createFileRoute("/o/$org")({ component: Items })

function Items() {
  const { org } = Route.useParams()
  const items = useQuery({
    queryKey: ["items", org],
    queryFn: () => getJSON<Item[]>(`/api/orgs/${encodeURIComponent(org)}/items/`),
  })

  if (items.isPending) return null
  if (items.isError) return <p className="text-destructive">Could not load items.</p>
  if (items.data.length === 0) return <p className="text-muted-foreground">No items yet.</p>
  return (
    <ul className="divide-y">
      {items.data.map((item) => (
        <li key={item.id} className="py-2">{item.title}</li>
      ))}
    </ul>
  )
}
