export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 pb-16 md:pb-24" aria-busy="true" aria-label="Cargando catálogo">
      {/* Encabezado */}
      <div className="bg-white border-b border-slate-200 mb-6 md:mb-8">
        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-5 md:pt-6 pb-6 md:pb-8 animate-pulse">
          <div className="h-3 w-40 bg-slate-100 rounded mb-5" />
          <div className="h-8 md:h-10 w-72 md:w-96 bg-slate-200 rounded-lg mb-3" />
          <div className="h-4 w-full max-w-xl bg-slate-100 rounded mb-2" />
          <div className="h-4 w-2/3 max-w-md bg-slate-100 rounded" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                <div className="h-3 w-24 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
          {/* Filtros */}
          <div className="w-full lg:w-1/4 shrink-0">
            <div className="lg:hidden h-12 bg-white border border-slate-200 rounded-xl animate-pulse" />
            <div className="hidden lg:block bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 w-full bg-slate-100 rounded" />
              ))}
              <div className="h-px bg-slate-100 my-6" />
              <div className="h-3 w-20 bg-slate-200 rounded" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 w-3/4 bg-slate-100 rounded" />
              ))}
              <div className="h-px bg-slate-100 my-6" />
              <div className="h-2 w-full bg-slate-100 rounded-full" />
            </div>
          </div>

          {/* Grilla */}
          <div className="w-full lg:w-3/4">
            <div className="h-12 bg-white border border-slate-200 rounded-xl mb-5 animate-pulse" />
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 animate-pulse">
              <div className="h-6 w-28 bg-slate-200 rounded" />
              <div className="h-10 w-44 bg-slate-100 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-slate-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-16 bg-slate-100 rounded" />
                    <div className="h-5 w-4/5 bg-slate-200 rounded" />
                    <div className="h-3 w-full bg-slate-100 rounded" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded" />
                  </div>
                  <div className="p-5 bg-slate-50/60 border-t border-slate-100 space-y-3">
                    <div className="h-7 w-32 bg-slate-200 rounded" />
                    <div className="h-10 w-full bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}