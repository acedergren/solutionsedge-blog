/// <reference types="@sveltejs/kit" />
/// <reference types="@auth/sveltekit" />

import type { Session } from '@auth/sveltekit';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}
		interface Locals {
			// getSession(): Promise<Session | null>;
		}
		interface PageData {
			session?: Session | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
