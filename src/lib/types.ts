export interface Author {
	name: string;
	avatar: string;
	bio: string;
}

export interface Article {
	id: string;
	title: string;
	excerpt: string;
	content: string;
	author: Author;
	publishedAt: Date;
	readingTime: number;
	tags: string[];
	imageUrl?: string;
	featured?: boolean;
}

export interface TrendingArticle {
	number: string;
	title: string;
	author: string;
	id: string;
}

export interface Topic {
	name: string;
	slug: string;
	description?: string;
	articleCount?: number;
}