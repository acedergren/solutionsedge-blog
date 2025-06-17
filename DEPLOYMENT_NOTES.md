# Deployment Notes

## Static Hosting Configuration for Linode Object Storage

### Issue: Clean URLs for Static Pages

When deploying to Linode Object Storage (or any S3-compatible static hosting), the `/about` route may not work correctly because the server doesn't know to serve `about.html` when `/about` is requested.

### Solutions:

1. **Configure Static Website Hosting in Linode**:
   - Set index document to `index.html`
   - Set error document to `404.html`
   - Enable website endpoint

2. **Use a CDN/Edge Service**:
   If Linode doesn't support clean URLs natively, consider using Cloudflare or another CDN that can:
   - Rewrite `/about` to `/about.html`
   - Handle proper routing for all static pages

3. **Alternative: Update Links**:
   As a last resort, update all internal links to include `.html`:
   ```html
   <a href="/about.html">About</a>
   ```

### Testing Routes:
- Direct access: `https://yourdomain.com/about`
- With extension: `https://yourdomain.com/about.html`
- From navigation: Click "About" link from homepage

### Cookie Consent & RUM Integration

The site uses Akamai mPulse for Real User Monitoring (RUM), which is injected at the edge level. Cookie consent is required for RUM to function properly.

- Performance cookies control mPulse RUM activation
- Rejecting cookies now shows an informative page explaining why cookies are needed
- Users can change their cookie preferences at any time via the cookie settings button