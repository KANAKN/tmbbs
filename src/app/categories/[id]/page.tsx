// for debugging Vercel build issue
export default async function CategoryPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Category ID: {params.id}</h1>
      <p>This is a minimal page for debugging a Vercel build issue.</p>
    </div>
  )
}