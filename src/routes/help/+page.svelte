<svelte:head>
	<title>Help - The Solutions Edge</title>
	<meta name="description" content="Get help with The Solutions Edge platform and find answers to common questions." />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<h1 class="article-title mb-8">Help Center</h1>

	<!-- Search -->
	<div class="relative mb-12">
		<input 
			type="search" 
			placeholder="Search for help..."
			class="w-full px-4 py-3 pl-12 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-md-primary"
		/>
		<span class="material-icons-outlined absolute left-4 top-3.5 text-[20px] text-md-on-surface-variant">
			search
		</span>
	</div>

	<!-- FAQ Categories -->
	<div class="grid md:grid-cols-2 gap-6 mb-12">
		<div class="block p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg hover:shadow-lg transition-all duration-200 group cursor-pointer">
			<span class="material-icons-outlined text-[40px] text-md-primary mb-3 block">
				rocket_launch
			</span>
			<h3 class="font-bold text-lg mb-2">Getting Started</h3>
			<p class="text-sm text-md-on-surface-variant">
				New to The Solutions Edge? Start here to learn the basics.
			</p>
		</div>

		<div class="block p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg hover:shadow-lg transition-all duration-200 group cursor-pointer">
			<span class="material-icons-outlined text-[40px] text-md-primary mb-3 block">
				edit_note
			</span>
			<h3 class="font-bold text-lg mb-2">Writing & Publishing</h3>
			<p class="text-sm text-md-on-surface-variant">
				Learn how to write, format, and publish your articles.
			</p>
		</div>

		<div class="block p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg hover:shadow-lg transition-all duration-200 group cursor-pointer">
			<span class="material-icons-outlined text-[40px] text-md-primary mb-3 block">
				account_circle
			</span>
			<h3 class="font-bold text-lg mb-2">Account & Settings</h3>
			<p class="text-sm text-md-on-surface-variant">
				Manage your profile, preferences, and account settings.
			</p>
		</div>

		<div class="block p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg hover:shadow-lg transition-all duration-200 group cursor-pointer">
			<span class="material-icons-outlined text-[40px] text-md-primary mb-3 block">
				groups
			</span>
			<h3 class="font-bold text-lg mb-2">Community Guidelines</h3>
			<p class="text-sm text-md-on-surface-variant">
				Our community standards and best practices.
			</p>
		</div>
	</div>

	<!-- Common Questions -->
	<section class="space-y-8">
		<h2 class="text-2xl font-bold">Frequently Asked Questions</h2>

		<details class="border-b border-md-outline dark:border-md-dark-outline pb-4">
			<summary class="font-medium cursor-pointer hover:text-md-primary transition-colors">
				How do I start writing on The Solutions Edge?
			</summary>
			<p class="mt-3 text-sm text-md-on-surface-variant">
				Click the "Write" button in the navigation bar to start creating your article. 
				You can use Markdown formatting, add code blocks, and include images. 
				Save drafts as you go and publish when ready.
			</p>
		</details>

		<details class="border-b border-md-outline dark:border-md-dark-outline pb-4">
			<summary class="font-medium cursor-pointer hover:text-md-primary transition-colors">
				What topics can I write about?
			</summary>
			<p class="mt-3 text-sm text-md-on-surface-variant">
				We focus on technical content related to cloud computing, edge technologies, 
				DevOps, security, and software architecture. Your content should be original, 
				informative, and provide value to fellow engineers.
			</p>
		</details>

		<details class="border-b border-md-outline dark:border-md-dark-outline pb-4">
			<summary class="font-medium cursor-pointer hover:text-md-primary transition-colors">
				How do I format code in my articles?
			</summary>
			<p class="mt-3 text-sm text-md-on-surface-variant">
				Use triple backticks (```) for code blocks, optionally specifying the language. 
				For inline code, wrap text in single backticks (`). The editor supports syntax 
				highlighting for most programming languages.
			</p>
		</details>

		<details class="border-b border-md-outline dark:border-md-dark-outline pb-4">
			<summary class="font-medium cursor-pointer hover:text-md-primary transition-colors">
				Can I edit my published articles?
			</summary>
			<p class="mt-3 text-sm text-md-on-surface-variant">
				Yes, you can edit your articles after publishing. Navigate to your article and 
				click the "Edit" button. Changes will be reflected immediately, and readers will 
				see an "Updated" timestamp.
			</p>
		</details>
	</section>

	<!-- Contact Support -->
	<section class="mt-12 p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg text-center">
		<h3 class="font-bold text-lg mb-2">Still need help?</h3>
		<p class="text-sm text-md-on-surface-variant mb-4">
			Our support team is here to assist you
		</p>
		<a href="/contact" class="btn-primary">
			Contact Support
		</a>
	</section>
</div>