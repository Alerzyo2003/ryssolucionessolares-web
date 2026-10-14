export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 pb-20" aria-busy="true" aria-label="Cargando producto">
      <div className="mx-auto max-w-6xl animate-pulse px-5 md:px-8">
        <div className="flex items-center gap-2 py-6">
          <div className="h-3 w-12 rounded bg-slate-200" />
          <div className="h-3 w-12 rounded bg-slate-200" />
          <div className="h-3 w-40 rounded bg-slate-200" />
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div>
            <div className="aspect-square w-full rounded-3xl border border-slate-200 bg-white" />
            <div className="mt-4 grid grid-cols-5 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-slate-200" />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-9 w-4/5 rounded-lg bg-slate-200" />
            <div className="h-7 w-28 rounded-full bg-slate-200" />
            <div className="h-12 w-56 rounded-lg bg-slate-200" />
            <div className="flex gap-3">
              <div className="h-12 w-32 rounded-xl bg-slate-200" />
              <div className="h-12 flex-1 rounded-xl bg-slate-300" />
            </div>
            <div className="h-12 w-full rounded-xl bg-slate-200" />
            <div className="space-y-px overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3.5 px-4 py-3.5">
                  <div className="h-9 w-9 rounded-xl bg-slate-100" />
                  <div className="space-y-2">
                    <div className="h-3 w-36 rounded bg-slate-200" />
                    <div className="h-3 w-24 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}