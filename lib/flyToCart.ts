/**
 * Anima una copia de la imagen del producto desde su tarjeta hasta el
 * ícono del carrito (el elemento con el atributo `data-cart-target`).
 *
 * - Busca la imagen dentro de `[data-fly-source]` o, si no existe, del <article> más cercano.
 * - Si no hay imagen, vuela un punto naranja desde el botón.
 * - Al aterrizar dispara el evento `cart:landed` (el navbar lo usa para el "rebote").
 * - Respeta `prefers-reduced-motion`: en ese caso no anima y resuelve al instante.
 */
export const CART_LANDED_EVENT = 'cart:landed'

export function flyToCart(source: HTMLElement | null): Promise<void> {
  return new Promise((resolve) => {
    const land = () => {
      window.dispatchEvent(new Event(CART_LANDED_EVENT))
      resolve()
    }

    const target = document.querySelector<HTMLElement>('[data-cart-target]')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!source || !target || reduceMotion || typeof source.animate !== 'function') {
      land()
      return
    }

    const container =
      source.closest<HTMLElement>('[data-fly-source]') ?? source.closest<HTMLElement>('article')
    const img = container?.querySelector<HTMLImageElement>('img') ?? null
    const src = img?.currentSrc || img?.src || ''
    const hasImage = Boolean(src)

    const fromRect = (img ?? source).getBoundingClientRect()
    const toRect = target.getBoundingClientRect()

    const fromX = fromRect.left + fromRect.width / 2
    const fromY = fromRect.top + fromRect.height / 2
    const dx = toRect.left + toRect.width / 2 - fromX
    const dy = toRect.top + toRect.height / 2 - fromY

    const size = hasImage ? 120 : 28
    const endScale = Math.max(0.12, 26 / size)

    const el = document.createElement('div')
    Object.assign(el.style, {
      position: 'fixed',
      left: `${fromX - size / 2}px`,
      top: `${fromY - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      zIndex: '9999',
      pointerEvents: 'none',
      boxSizing: 'border-box',
      willChange: 'transform, opacity',
      ...(hasImage
        ? {
            padding: '8px',
            borderRadius: '18px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            backgroundImage: `url("${src.replace(/"/g, '%22')}")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            backgroundOrigin: 'content-box',
            boxShadow: '0 18px 40px -10px rgba(15,23,42,0.35)',
          }
        : {
            borderRadius: '9999px',
            backgroundColor: '#ea580c',
            boxShadow: '0 8px 20px -6px rgba(234,88,12,0.6)',
          }),
    } as Partial<CSSStyleDeclaration>)
    document.body.appendChild(el)

    let done = false
    const cleanup = () => {
      if (done) return
      done = true
      el.remove()
      land()
    }

    const anim = el.animate(
      [
        {
          transform: 'translate(0px, 0px) scale(1)',
          opacity: 1,
          offset: 0,
          easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)',
        },
        {
          // pequeño "salto" hacia arriba antes de caer hacia el carrito
          transform: `translate(${dx * 0.3}px, ${dy * 0.1 - 50}px) scale(0.72)`,
          opacity: 1,
          offset: 0.4,
          easing: 'cubic-bezier(0.6, 0, 0.9, 0.5)',
        },
        {
          transform: `translate(${dx}px, ${dy}px) scale(${endScale})`,
          opacity: 0.7,
          offset: 1,
        },
      ],
      { duration: 750, fill: 'forwards' }
    )

    anim.onfinish = cleanup
    anim.oncancel = cleanup
    window.setTimeout(cleanup, 1400) // seguro por si algo falla
  })
}