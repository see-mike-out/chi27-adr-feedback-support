export interface Criterion {
	key: string;
	label: string;
}

export interface Draft {
	venue: string;
	paperId: string;
	fields: Record<string, string>;
}

export const CRITERIA: readonly Criterion[] = [
	{ key: 'originality', label: 'Originality' },
	{ key: 'correctness', label: 'Correctness' },
	{ key: 'novelty', label: 'Novelty' },
	{ key: 'importance', label: 'Importance' },
	{ key: 'clarity', label: 'Clarity' }
] as const;

export const PLACEHOLDER = '#needs to fill#';

export const STORAGE_KEY = 'chi27-adr-feedback:draft';

export const emptyDraft: Draft = {
	venue: "CHI'27",
	paperId: '',
	fields: Object.fromEntries(CRITERIA.map(({ key }) => [key, '']))
};

export function buildLetter(draft: Draft): string {
	const venue = draft.venue.trim() || "CHI'27";
	const body = CRITERIA.map(
		({ key, label }) => `${label}: ${draft.fields[key]?.trim() || PLACEHOLDER}`
	).join('\n');

	return `Dear Authors,

Thank you for submitting your manuscript to ${venue}.  After careful deliberation, the AC and SC conclude that this submission and its contribution are difficult for our community to assess with fairness in its current form. As a result, the discussion led to a joint decision of assisted desk reject (ADR) for this paper.

Please find below a brief review highlighting some of the main challenges we identified with this paper.

${body}
`;
}

export function filledCount(draft: Draft): number {
	return CRITERIA.filter(({ key }) => draft.fields[key]?.trim()).length;
}

/** Normalizes a saved value of unknown shape into a usable draft. */
export function parseDraft(raw: unknown): Draft {
	const value = (raw ?? {}) as Partial<Draft>;
	const fields = { ...emptyDraft.fields };

	if (value.fields && typeof value.fields === 'object') {
		for (const { key } of CRITERIA) {
			const entry = (value.fields as Record<string, unknown>)[key];
			if (typeof entry === 'string') fields[key] = entry;
		}
	}

	return {
		venue: typeof value.venue === 'string' ? value.venue : emptyDraft.venue,
		paperId: typeof value.paperId === 'string' ? value.paperId : '',
		fields
	};
}

/** Paper ID only names the file; it never appears in the letter. */
export function fileName(paperId: string): string {
	const slug = paperId
		.trim()
		.replace(/[^a-zA-Z0-9._-]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return slug ? `adr-feedback-${slug}.txt` : 'adr-feedback.txt';
}
