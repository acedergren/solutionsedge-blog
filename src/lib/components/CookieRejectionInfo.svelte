<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let showInfo = false;
	
	onMount(() => {
		// Check if user was redirected due to cookie rejection
		if (browser && window.location.hash === '#cookie-rejected') {
			showInfo = true;
		}
	});
	
	function acceptCookies() {
		// Clear the hash and reload to show consent banner again
		window.location.hash = '';
		window.location.reload();
	}
</script>

{#if showInfo}
<div class="rejection-container">
	<div class="rejection-card">
		<div class="icon-container">
			<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
		</div>
		
		<h2 class="title">Cookie Consent Required</h2>
		
		<div class="content">
			<p class="lead">
				This website requires cookies for Real User Monitoring (RUM) to function properly.
			</p>
			
			<div class="info-box">
				<h3>Why we need cookies:</h3>
				<ul>
					<li><strong>Performance Monitoring:</strong> We use Akamai mPulse RUM to monitor site performance and user experience.</li>
					<li><strong>Edge-Injected Scripts:</strong> RUM scripts are injected at the edge (CDN level), not from our static site.</li>
					<li><strong>No Server-Side Control:</strong> As a static site, we cannot disable these monitoring features server-side.</li>
				</ul>
			</div>
			
			<div class="privacy-note">
				<p>
					<strong>Your Privacy Matters:</strong> We only collect anonymous performance metrics. 
					No personal data is tracked without your consent. You can review our 
					<a href="/privacy" target="_blank">Privacy Policy</a> for more details.
				</p>
			</div>
			
			<div class="technical-details">
				<details>
					<summary>Technical Details</summary>
					<div class="details-content">
						<p>
							This site is deployed as a static site on edge infrastructure. Performance monitoring 
							scripts are automatically injected by our CDN provider (Akamai) to ensure optimal 
							delivery and user experience. These scripts require cookies to:
						</p>
						<ul>
							<li>Measure page load times and performance metrics</li>
							<li>Track anonymous user sessions for performance analysis</li>
							<li>Identify performance bottlenecks and optimize content delivery</li>
						</ul>
						<p>
							Without these cookies, the monitoring scripts may cause functionality issues, 
							which is why we require consent before allowing access to the site.
						</p>
					</div>
				</details>
			</div>
		</div>
		
		<div class="actions">
			<button class="btn-primary" on:click={acceptCookies}>
				Accept Cookies & Continue
			</button>
			<a href="https://duckduckgo.com" class="btn-secondary">
				Leave Site
			</a>
		</div>
	</div>
</div>
{/if}

<style>
	.rejection-container {
		position: fixed;
		inset: 0;
		background: var(--md-surface);
		z-index: 10000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}
	
	:global(.dark) .rejection-container {
		background: var(--md-dark-surface);
	}
	
	.rejection-card {
		max-width: 600px;
		width: 100%;
		background: var(--md-surface-container);
		border-radius: 1rem;
		padding: 2rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
	}
	
	:global(.dark) .rejection-card {
		background: var(--md-dark-surface-container);
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
	}
	
	.icon-container {
		display: flex;
		justify-content: center;
		margin-bottom: 1.5rem;
	}
	
	.icon {
		width: 4rem;
		height: 4rem;
		color: var(--md-error);
	}
	
	.title {
		text-align: center;
		font-size: 1.75rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		color: var(--md-on-surface);
	}
	
	:global(.dark) .title {
		color: var(--md-dark-on-surface);
	}
	
	.content {
		space-y: 1.5rem;
	}
	
	.lead {
		text-align: center;
		font-size: 1.125rem;
		color: var(--md-on-surface-variant);
		margin-bottom: 1.5rem;
	}
	
	:global(.dark) .lead {
		color: var(--md-dark-on-surface-variant);
	}
	
	.info-box {
		background: var(--md-surface-variant);
		border-radius: 0.5rem;
		padding: 1.5rem;
		margin: 1.5rem 0;
	}
	
	:global(.dark) .info-box {
		background: var(--md-dark-surface-variant);
	}
	
	.info-box h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		color: var(--md-on-surface);
	}
	
	:global(.dark) .info-box h3 {
		color: var(--md-dark-on-surface);
	}
	
	.info-box ul {
		list-style: none;
		space-y: 0.5rem;
		padding: 0;
	}
	
	.info-box li {
		padding-left: 1.5rem;
		position: relative;
		color: var(--md-on-surface-variant);
		margin-bottom: 0.5rem;
	}
	
	:global(.dark) .info-box li {
		color: var(--md-dark-on-surface-variant);
	}
	
	.info-box li::before {
		content: "•";
		position: absolute;
		left: 0.5rem;
		color: var(--md-primary);
	}
	
	.privacy-note {
		background: var(--md-primary-container);
		border-radius: 0.5rem;
		padding: 1rem;
		margin: 1.5rem 0;
	}
	
	:global(.dark) .privacy-note {
		background: var(--md-dark-primary-container);
	}
	
	.privacy-note p {
		margin: 0;
		color: var(--md-on-primary-container);
	}
	
	:global(.dark) .privacy-note p {
		color: var(--md-dark-on-primary-container);
	}
	
	.privacy-note a {
		color: var(--md-primary);
		text-decoration: underline;
	}
	
	.technical-details {
		margin-top: 1.5rem;
	}
	
	.technical-details summary {
		cursor: pointer;
		padding: 0.75rem;
		background: var(--md-surface-variant);
		border-radius: 0.5rem;
		font-weight: 500;
		color: var(--md-on-surface-variant);
	}
	
	:global(.dark) .technical-details summary {
		background: var(--md-dark-surface-variant);
		color: var(--md-dark-on-surface-variant);
	}
	
	.details-content {
		margin-top: 1rem;
		padding: 1rem;
		color: var(--md-on-surface-variant);
		font-size: 0.875rem;
		line-height: 1.6;
	}
	
	:global(.dark) .details-content {
		color: var(--md-dark-on-surface-variant);
	}
	
	.details-content ul {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}
	
	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
	}
	
	.btn-primary,
	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-weight: 500;
		text-decoration: none;
		transition: all 0.2s;
		border: none;
		cursor: pointer;
		font-size: 1rem;
	}
	
	.btn-primary {
		background: var(--md-primary);
		color: var(--md-on-primary);
	}
	
	.btn-primary:hover {
		background: var(--md-primary-hover);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
	
	.btn-secondary {
		background: transparent;
		color: var(--md-on-surface);
		border: 1px solid var(--md-outline);
		display: inline-flex;
		align-items: center;
	}
	
	:global(.dark) .btn-secondary {
		color: var(--md-dark-on-surface);
		border-color: var(--md-dark-outline);
	}
	
	.btn-secondary:hover {
		background: var(--md-surface-variant);
	}
	
	:global(.dark) .btn-secondary:hover {
		background: var(--md-dark-surface-variant);
	}
	
	@media (max-width: 640px) {
		.rejection-card {
			padding: 1.5rem;
		}
		
		.actions {
			flex-direction: column;
			width: 100%;
		}
		
		.btn-primary,
		.btn-secondary {
			width: 100%;
			text-align: center;
			justify-content: center;
		}
	}
</style>