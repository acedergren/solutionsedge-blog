<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { fade, fly } from 'svelte/transition';

	let showBanner = false;
	let showSettings = false;
	let hasConsented = false;

	// Cookie categories
	let cookiePreferences = {
		essential: true, // Always true, cannot be disabled
		performance: false,
		functional: false,
		analytics: false
	};

	onMount(() => {
		if (browser) {
			// Check cookies first, then localStorage as fallback
			let consent = getCookie('cookieConsent');
			let preferences = getCookie('cookiePreferences');
			
			// Fallback to localStorage if cookies not found
			if (!consent) {
				consent = localStorage.getItem('cookieConsent');
			}
			if (!preferences) {
				preferences = localStorage.getItem('cookiePreferences');
			}
			
			if (consent) {
				hasConsented = true;
				if (preferences) {
					const saved = JSON.parse(preferences);
					cookiePreferences = { ...cookiePreferences, ...saved };
					applyCookiePreferences();
				}
			} else {
				// Show banner after a short delay
				setTimeout(() => {
					showBanner = true;
				}, 1000);
			}
		}
	});

	function acceptAll() {
		cookiePreferences = {
			essential: true,
			performance: true,
			functional: true,
			analytics: true
		};
		saveConsent();
	}

	function acceptSelected() {
		saveConsent();
	}

	function rejectAll() {
		// Show informative page about why cookies are needed
		if (browser) {
			// Set a flag and reload to show the rejection info
			window.location.hash = '#cookie-rejected';
			window.location.reload();
		}
	}

	function setCookie(name: string, value: string, days: number) {
		if (browser) {
			const expires = new Date();
			expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
			document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
		}
	}

	function getCookie(name: string): string | null {
		if (!browser) return null;
		const nameEQ = name + "=";
		const ca = document.cookie.split(';');
		for(let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) === ' ') c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
	}

	function saveConsent() {
		if (browser) {
			// Save consent in cookies with 1 year expiration
			setCookie('cookieConsent', 'true', 365);
			setCookie('cookieConsentDate', new Date().toISOString(), 365);
			setCookie('cookiePreferences', JSON.stringify(cookiePreferences), 365);
			
			// Also save in localStorage as backup
			localStorage.setItem('cookieConsent', 'true');
			localStorage.setItem('cookieConsentDate', new Date().toISOString());
			localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
			
			hasConsented = true;
			showBanner = false;
			showSettings = false;
			applyCookiePreferences();
		}
	}

	function applyCookiePreferences() {
		if (browser) {
			// Send preferences to mPulse or other services
			if (window.BOOMR && window.BOOMR.utils) {
				// mPulse consent handling
				if (!cookiePreferences.performance) {
					// Disable mPulse if performance cookies are rejected
					window.BOOMR.disable();
				} else {
					// Enable mPulse if performance cookies are accepted
					window.BOOMR.enable();
				}
			}

			// Dispatch custom event for other scripts to handle
			window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
				detail: cookiePreferences
			}));
		}
	}

	function openSettings() {
		showSettings = true;
	}

	function closeSettings() {
		showSettings = false;
	}

	// Function to open cookie settings from anywhere in the app
	if (browser) {
		window.openCookieSettings = () => {
			showBanner = true;
			showSettings = true;
		};
	}
</script>

{#if showBanner && !hasConsented}
	<!-- Page overlay to dim content -->
	<div
		class="page-overlay"
		transition:fade={{ duration: 300 }}
	/>
	
	<div
		class="cookie-banner"
		transition:fly={{ y: 100, duration: 300 }}
		role="dialog"
		aria-label="Cookie consent"
		aria-describedby="cookie-description"
	>
		<div class="cookie-content">
			<div class="cookie-text">
				<h3 class="md-title-medium mb-2">We value your privacy</h3>
				<p id="cookie-description" class="md-body-medium text-md-on-surface-variant">
					We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
					By clicking "Accept All", you consent to our use of cookies. You can manage your preferences by 
					clicking "Cookie Settings".
				</p>
				<p class="text-sm text-red-600 dark:text-red-400 font-medium mt-2">
					⚠️ Warning: Rejecting cookies will redirect you away from this site.
				</p>
				<a href="/privacy" class="text-md-primary hover:underline text-sm">Privacy Policy</a>
			</div>
			
			<div class="cookie-actions">
				<button
					class="btn-ghost"
					on:click={openSettings}
					aria-label="Open cookie settings"
				>
					Cookie Settings
				</button>
				<button
					class="btn-secondary"
					on:click={rejectAll}
					aria-label="Reject all cookies"
				>
					Reject All
				</button>
				<button
					class="btn-primary"
					on:click={acceptAll}
					aria-label="Accept all cookies"
				>
					Accept All
				</button>
			</div>
		</div>
	</div>
{/if}

{#if showSettings}
	<div
		class="cookie-settings-overlay"
		transition:fade={{ duration: 200 }}
		on:click={closeSettings}
		role="presentation"
	/>
	
	<div
		class="cookie-settings"
		transition:fly={{ y: 20, duration: 300 }}
		role="dialog"
		aria-label="Cookie preferences"
	>
		<div class="cookie-settings-header">
			<h2 class="md-headline-small">Cookie Preferences</h2>
			<button
				class="close-button"
				on:click={closeSettings}
				aria-label="Close cookie settings"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
		
		<div class="cookie-settings-body">
			<p class="md-body-medium text-md-on-surface-variant mb-4">
				Manage your cookie preferences below. Essential cookies cannot be disabled as they are 
				required for the website to function properly.
			</p>
			<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
				<p class="text-sm text-red-700 dark:text-red-300 font-medium">
					⚠️ Important: Clicking "Reject All" will redirect you away from this site.
				</p>
			</div>
			
			<div class="cookie-categories">
				<!-- Essential Cookies -->
				<div class="cookie-category">
					<div class="category-header">
						<input
							type="checkbox"
							id="essential"
							checked={true}
							disabled
							class="cookie-toggle"
						/>
						<label for="essential" class="category-label">
							<span class="category-title">Essential Cookies</span>
							<span class="category-status">Always Active</span>
						</label>
					</div>
					<p class="category-description">
						These cookies are necessary for the website to function and cannot be switched off. 
						They are usually set in response to actions made by you such as setting your privacy 
						preferences, logging in, or filling in forms.
					</p>
				</div>
				
				<!-- Performance Cookies -->
				<div class="cookie-category">
					<div class="category-header">
						<input
							type="checkbox"
							id="performance"
							bind:checked={cookiePreferences.performance}
							class="cookie-toggle"
						/>
						<label for="performance" class="category-label">
							<span class="category-title">Performance Cookies (mPulse RUM)</span>
							<span class="category-status">{cookiePreferences.performance ? 'Active' : 'Inactive'}</span>
						</label>
					</div>
					<p class="category-description">
						These cookies allow us to count visits and traffic sources using Akamai mPulse Real User 
						Monitoring. They help us understand how visitors interact with our website, which pages 
						are most popular, and monitor site performance.
					</p>
				</div>
				
				<!-- Functional Cookies -->
				<div class="cookie-category">
					<div class="category-header">
						<input
							type="checkbox"
							id="functional"
							bind:checked={cookiePreferences.functional}
							class="cookie-toggle"
						/>
						<label for="functional" class="category-label">
							<span class="category-title">Functional Cookies</span>
							<span class="category-status">{cookiePreferences.functional ? 'Active' : 'Inactive'}</span>
						</label>
					</div>
					<p class="category-description">
						These cookies enable enhanced functionality and personalization, such as remembering 
						your preferences (e.g., dark mode) and providing enhanced features.
					</p>
				</div>
				
				<!-- Analytics Cookies -->
				<div class="cookie-category">
					<div class="category-header">
						<input
							type="checkbox"
							id="analytics"
							bind:checked={cookiePreferences.analytics}
							class="cookie-toggle"
						/>
						<label for="analytics" class="category-label">
							<span class="category-title">Analytics Cookies</span>
							<span class="category-status">{cookiePreferences.analytics ? 'Active' : 'Inactive'}</span>
						</label>
					</div>
					<p class="category-description">
						These cookies help us understand how visitors interact with our website by collecting 
						and reporting information anonymously. This helps us improve our content and user experience.
					</p>
				</div>
			</div>
		</div>
		
		<div class="cookie-settings-footer">
			<button
				class="btn-secondary"
				on:click={rejectAll}
			>
				Reject All
			</button>
			<button
				class="btn-primary"
				on:click={acceptSelected}
			>
				Save Preferences
			</button>
		</div>
	</div>
{/if}

<!-- Floating cookie button for users who have consented -->
{#if hasConsented && !showBanner}
	<button
		class="cookie-float-button"
		on:click={() => { showBanner = true; showSettings = true; }}
		aria-label="Cookie settings"
		title="Cookie settings"
		transition:fade={{ duration: 200 }}
	>
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
				d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
		</svg>
	</button>
{/if}

<style>
	.page-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		z-index: 9998;
	}

	.cookie-banner {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 9999;
		background: #f3f4f6;
		border-top: 1px solid #e5e7eb;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
		padding: 1.5rem;
		backdrop-filter: blur(10px);
	}

	:global(.dark) .cookie-banner {
		background: rgba(31, 41, 55, 0.95);
		border-color: #374151;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
	}

	.cookie-content {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 2rem;
		align-items: center;
	}

	.cookie-text {
		flex: 1;
		color: #1f2937;
	}
	
	:global(.dark) .cookie-text {
		color: #f3f4f6;
	}
	
	.cookie-text h3 {
		color: #111827;
		margin: 0 0 0.5rem 0;
	}
	
	:global(.dark) .cookie-text h3 {
		color: #f9fafb;
	}
	
	.cookie-text p {
		color: #4b5563;
		margin: 0 0 0.5rem 0;
	}
	
	:global(.dark) .cookie-text p {
		color: #9ca3af;
	}
	
	.cookie-text a {
		color: #3b82f6;
		text-decoration: underline;
	}
	
	:global(.dark) .cookie-text a {
		color: #60a5fa;
	}

	.cookie-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.cookie-settings-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 10000;
	}

	.cookie-settings {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: var(--md-surface);
		border-radius: 1rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		max-width: 600px;
		width: 90%;
		max-height: 80vh;
		overflow: hidden;
		z-index: 10001;
		display: flex;
		flex-direction: column;
	}

	:global(.dark) .cookie-settings {
		background: var(--md-dark-surface);
	}

	.cookie-settings-header {
		padding: 1.5rem;
		border-bottom: 1px solid var(--md-outline-variant);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	:global(.dark) .cookie-settings-header {
		border-color: var(--md-dark-outline-variant);
	}

	.close-button {
		padding: 0.5rem;
		background: transparent;
		border: none;
		cursor: pointer;
		border-radius: 0.5rem;
		transition: background 0.2s;
		color: var(--md-on-surface-variant);
	}

	:global(.dark) .close-button {
		color: var(--md-dark-on-surface-variant);
	}

	.close-button:hover {
		background: var(--md-surface-variant);
	}

	:global(.dark) .close-button:hover {
		background: var(--md-dark-surface-variant);
	}

	.cookie-settings-body {
		padding: 1.5rem;
		overflow-y: auto;
		flex: 1;
	}

	.cookie-categories {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.cookie-category {
		padding: 1.5rem;
		background: var(--md-surface-container);
		border-radius: 0.75rem;
		border: 1px solid var(--md-outline-variant);
	}

	:global(.dark) .cookie-category {
		background: var(--md-dark-surface-container);
		border-color: var(--md-dark-outline-variant);
	}

	.category-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}

	.cookie-toggle {
		width: 3rem;
		height: 1.75rem;
		appearance: none;
		background: var(--md-surface-variant);
		border-radius: 2rem;
		position: relative;
		cursor: pointer;
		transition: background 0.3s;
		flex-shrink: 0;
	}

	:global(.dark) .cookie-toggle {
		background: var(--md-dark-surface-variant);
	}

	.cookie-toggle:checked {
		background: var(--md-primary);
	}

	.cookie-toggle:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.cookie-toggle::after {
		content: '';
		position: absolute;
		top: 0.125rem;
		left: 0.125rem;
		width: 1.5rem;
		height: 1.5rem;
		background: white;
		border-radius: 50%;
		transition: transform 0.3s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.cookie-toggle:checked::after {
		transform: translateX(1.25rem);
	}

	.category-label {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
	}

	.category-title {
		font-weight: 500;
		color: var(--md-on-surface);
	}

	:global(.dark) .category-title {
		color: var(--md-dark-on-surface);
	}

	.category-status {
		font-size: 0.875rem;
		color: var(--md-on-surface-variant);
	}

	:global(.dark) .category-status {
		color: var(--md-dark-on-surface-variant);
	}

	.category-description {
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--md-on-surface-variant);
		margin: 0;
	}

	:global(.dark) .category-description {
		color: var(--md-dark-on-surface-variant);
	}

	.cookie-settings-footer {
		padding: 1.5rem;
		border-top: 1px solid var(--md-outline-variant);
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		background: var(--md-surface-container);
	}

	:global(.dark) .cookie-settings-footer {
		border-color: var(--md-dark-outline-variant);
		background: var(--md-dark-surface-container);
	}

	.cookie-float-button {
		position: fixed;
		bottom: 2rem;
		left: 2rem;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: var(--md-primary);
		color: var(--md-on-primary);
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: all 0.3s;
		z-index: 1000;
	}

	.cookie-float-button:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.cookie-content {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.cookie-actions {
			justify-content: stretch;
		}

		.cookie-actions button {
			flex: 1;
		}

		.cookie-settings {
			width: 100%;
			height: 100%;
			max-height: 100%;
			border-radius: 0;
			transform: translate(-50%, -50%) !important;
		}

		.cookie-float-button {
			bottom: 1rem;
			left: 1rem;
		}
	}
</style>