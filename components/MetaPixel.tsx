'use client'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export default function MetaPixel() {
  const pathname = usePathname()
  const firstLoad = useRef(true)

  // PageView en cada cambio de página
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false
      return
    }
    ;(window as any).fbq?.('track', 'PageView')
  }, [pathname])

  // Contact en cualquier clic a WhatsApp o teléfono
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a')
      const href = link?.getAttribute('href') || ''
      if (href.includes('wa.me')) {
        ;(window as any).fbq?.('track', 'Contact', { method: 'whatsapp' })
      } else if (href.startsWith('tel:')) {
        ;(window as any).fbq?.('track', 'Contact', { method: 'phone' })
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');
fbq('track','PageView');`}
    </Script>
  )
}