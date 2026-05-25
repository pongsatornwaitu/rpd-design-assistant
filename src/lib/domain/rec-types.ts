export type Severity = 'info' | 'good' | 'warn' | 'danger';

export interface Reference {
	source: string;
	page?: string;
}

export interface Recommendation {
	title: string;
	detail: string;
	severity: Severity;
	references: Reference[];
}
