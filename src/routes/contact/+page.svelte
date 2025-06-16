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
								hello@solutionsedge.com
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
							<p class="font-medium">Social Media</p>
							<p class="text-sm text-md-on-surface-variant">
								Follow us on Twitter and LinkedIn
							</p>
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