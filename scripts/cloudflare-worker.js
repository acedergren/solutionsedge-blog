// Cloudflare Worker for SPA routing
// This worker ensures proper routing for your SvelteKit static site

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  let pathname = url.pathname

  // Remove trailing slash for consistency (except for root)
  if (pathname !== '/' && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1)
  }

  // Try to fetch the exact path first
  let response = await fetch(request)

  // If we get a 404, try different strategies
  if (response.status === 404) {
    // Try with /index.html appended
    const indexPath = pathname + '/index.html'
    response = await fetch(new Request(url.origin + indexPath, request))

    // If still 404 and it's an article route, serve the main index.html
    if (response.status === 404 && pathname.startsWith('/article/')) {
      response = await fetch(new Request(url.origin + '/index.html', request))
      
      // Modify response to ensure client-side routing works
      if (response.ok) {
        const html = await response.text()
        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Cache-Control': 'public, max-age=300',
          }
        })
      }
    }

    // For other 404s, serve the 404 page
    if (response.status === 404) {
      response = await fetch(new Request(url.origin + '/404.html', request))
      return new Response(await response.text(), {
        status: 404,
        headers: response.headers
      })
    }
  }

  // Add security headers
  const newHeaders = new Headers(response.headers)
  newHeaders.set('X-Content-Type-Options', 'nosniff')
  newHeaders.set('X-Frame-Options', 'DENY')
  newHeaders.set('X-XSS-Protection', '1; mode=block')
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Return response with modified headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  })
}