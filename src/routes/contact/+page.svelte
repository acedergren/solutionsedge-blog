<script lang="ts">
	let name = '';
	let email = '';
	let subject = '';
	let message = '';
	let submitted = false;

	function handleSubmit(e: Event) {
		e.preventDefault();
		// In a real app, this would send the form data
		submitted = true;
	}
</script>

<svelte:head>
	<title>Contact - The Solutions Edge</title>
	<meta name="description" content="Get in touch with The Solutions Edge team." />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<h1 class="article-title mb-4 text-center">Contact Us</h1>
	<p class="text-center text-lg text-md-on-surface-variant dark:text-md-dark-on-surface-variant mb-12">
		Have a question, suggestion, or want to contribute? We'd love to hear from you.
	</p>

	<div class="grid md:grid-cols-2 gap-12">
		<!-- Contact Form -->
		<div>
			{#if !submitted}
				<form on:submit={handleSubmit} class="space-y-6">
					<div>
						<label for="name" class="block text-sm font-medium mb-2">
							Your Name
						</label>
						<input
							id="name"
							type="text"
							bind:value={name}
							required
							class="w-full px-4 py-2 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg border border-md-outline dark:border-md-dark-outline focus:outline-none focus:ring-2 focus:ring-md-primary"
						/>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium mb-2">
							Email Address
						</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							required
							class="w-full px-4 py-2 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg border border-md-outline dark:border-md-dark-outline focus:outline-none focus:ring-2 focus:ring-md-primary"
						/>
					</div>

					<div>
						<label for="subject" class="block text-sm font-medium mb-2">
							Subject
						</label>
						<select
							id="subject"
							bind:value={subject}
							required
							class="w-full px-4 py-2 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg border border-md-outline dark:border-md-dark-outline focus:outline-none focus:ring-2 focus:ring-md-primary"
						>
							<option value="">Select a topic</option>
							<option value="general">General Inquiry</option>
							<option value="writing">Writing & Contributing</option>
							<option value="technical">Technical Issue</option>
							<option value="partnership">Partnership Opportunity</option>
							<option value="feedback">Feedback</option>
						</select>
					</div>

					<div>
						<label for="message" class="block text-sm font-medium mb-2">
							Message
						</label>
						<textarea
							id="message"
							bind:value={message}
							required
							rows="6"
							class="w-full px-4 py-2 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg border border-md-outline dark:border-md-dark-outline focus:outline-none focus:ring-2 focus:ring-md-primary resize-none"
						/>
					</div>

					<button type="submit" class="btn-primary w-full">
						Send Message
					</button>
				</form>
			{:else}
				<div class="text-center p-8 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg">
					<span class="material-icons-outlined text-[60px] text-md-primary mb-4 block">
						check_circle
					</span>
					<h3 class="font-bold text-xl mb-2">Thank you!</h3>
					<p class="text-md-on-surface-variant">
						Your message has been sent. We'll get back to you soon.
					</p>
				</div>
			{/if}
		</div>

		<!-- Contact Info -->
		<div class="space-y-8">
			<div>
				<h3 class="font-bold text-lg mb-4">Other Ways to Reach Us</h3>
				<div class="space-y-6">
					<div class="flex gap-4">
						<span class="material-icons-outlined text-md-primary">
							email
						</span>
						<div>
							<p class="font-medium">Email</p>
							<p class="text-sm text-md-on-surface-variant">
								alex@solutionsedge.io
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<span class="material-icons-outlined text-md-primary">
							forum
						</span>
						<div>
							<p class="font-medium">Community</p>
							<p class="text-sm text-md-on-surface-variant">
								Join our discussion forums
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<span class="material-icons-outlined text-md-primary">
							share
						</span>
						<div>
							<p class="font-medium">Connect with Me</p>
							<div class="flex gap-4 mt-2">
								<a href="https://www.linkedin.com/in/acedergr/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
									<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
										<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
									</svg>
								</a>
								<a href="https://github.com/acedergren" target="_blank" rel="noopener noreferrer" class="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors">
									<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
										<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
									</svg>
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg">
				<h4 class="font-bold mb-2">Want to Contribute?</h4>
				<p class="text-sm text-md-on-surface-variant">
					We're always looking for talented writers to share their expertise. 
					Contact us to learn more about contributing to The Solutions Edge.
				</p>
			</div>

			<div class="p-6 bg-md-primary/10 rounded-lg">
				<h4 class="font-bold mb-2">Response Time</h4>
				<p class="text-sm">
					We typically respond to inquiries within 1-2 business days.
				</p>
			</div>
		</div>
	</div>
</div>