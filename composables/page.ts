import { joinURL } from 'ufo'
import { kirbyStatic } from '#build/kql'

/**
 * Returns static data prefetched at build time
 */
export function useKirbyStaticData() {
  return kirbyStatic
}

/**
 * Returns the currently active page, similar to Kirby's `$page` global variable
 */
export function usePage<T extends Record<string, any> = Record<string, any>>() {
  return useState<T>('app.page', () => ({} as T))
}

/**
 * Sets the currently active page and updates the document head
 */
export function setPage<T extends Record<string, any>>(page?: T) {
  if (!page) return

  usePage().value = page

  // Build the page meta tags
  const { siteUrl } = useRuntimeConfig().public
  const site = useSite()
  const title = page.title
    ? `${page.title} – ${site.value.title}`
    : site.value.title
  const description = page.description || site.value.description
  const url = joinURL(siteUrl, useRoute().path)
  const image = page?.cover?.url || site.value.cover?.url

  // Write the meta tags to the document head
  useHead({
    title,
    bodyAttrs: {
      'data-template': page.intendedTemplate || 'default',
    },
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: image },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:url', content: url },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: image },
    ],
    link: [
      { rel: 'canonical', href: url },
      {
        rel: 'alternate',
        hreflang: 'x-default',
        href: url,
      },
    ],
  })

  usePageState().value = 'ready'
}

/**
 * Returns a promise that resolves when the page data has been loaded
 */
export async function hasPage() {
  const state = usePageState()
  if (state.value === 'ready') return true

  await until(state).toBe('ready')
  await nextTick()
  return true
}

/**
 * Alias for `hasPage()`
 */
export const isPageReady = hasPage

function usePageState() {
  return useState('app.state.page', () => 'pending')
}
