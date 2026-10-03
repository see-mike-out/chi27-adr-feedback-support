<script lang="ts">
	import {
		CRITERIA,
		STORAGE_KEY,
		buildLetter,
		emptyDraft,
		fileName,
		filledCount,
		parseDraft,
		type Draft
	} from '#lib/letter.js';

	let draft = $state<Draft>(structuredClone(emptyDraft));
	let restored = $state(false);
	let status = $state('');
	let error = $state('');

	const letter = $derived(buildLetter(draft));
	const filled = $derived(filledCount(draft));
	const complete = $derived(filled === CRITERIA.length);

	$effect(() => {
		if (restored) return;
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) draft = parseDraft(JSON.parse(saved));
		} catch {
			// A corrupt draft is not worth surfacing; start from an empty one.
		}
		restored = true;
	});

	$effect(() => {
		const snapshot = JSON.stringify($state.snapshot(draft));
		if (!restored) return;
		try {
			localStorage.setItem(STORAGE_KEY, snapshot);
		} catch {
			// Storage can be full or blocked; the letter still works without it.
		}
	});

	function flash(message: string) {
		status = message;
		setTimeout(() => (status = ''), 2000);
	}

	function guard(): boolean {
		if (complete) {
			error = '';
			return true;
		}
		error = `Fill all five criteria first — ${CRITERIA.length - filled} left.`;
		return false;
	}

	async function copy() {
		if (!guard()) return;
		try {
			await navigator.clipboard.writeText(letter);
			flash('Copied to clipboard');
		} catch {
			error = "Your browser blocked the clipboard. Select the preview and copy it manually.";
		}
	}

	function download() {
		if (!guard()) return;
		const blob = new Blob([letter], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName(draft.paperId);
		a.click();
		URL.revokeObjectURL(url);
		flash(`Saved ${fileName(draft.paperId)}`);
	}

	function clearDraft() {
		draft = structuredClone(emptyDraft);
		error = '';
		flash('Draft cleared');
	}
</script>

<svelte:head>
	<title>ADR feedback letter</title>
</svelte:head>

<main>
	<header>
		<h1>ADR feedback letter</h1>
		<p>Fill the five criteria. The rest of the letter is fixed.</p>
	</header>

	<div class="columns">
		<section class="form" aria-label="Letter details">
			<div class="meta">
				<div>
					<label for="venue">Venue</label>
					<input id="venue" bind:value={draft.venue} />
				</div>
				<div>
					<label for="paper-id">Paper ID <span class="hint">file name only</span></label>
					<input id="paper-id" bind:value={draft.paperId} placeholder="1234" />
				</div>
			</div>

			{#each CRITERIA as { key, label } (key)}
				<div class="field">
					<label for={key}>{label}</label>
					<textarea
						id={key}
						bind:value={draft.fields[key]}
						placeholder="Describe the concern…"
					></textarea>
				</div>
			{/each}
		</section>

		<section class="output" aria-label="Letter preview">
			<div class="bar">
				<h2>Preview</h2>
				<span class="count">{filled} of {CRITERIA.length} filled</span>
			</div>

			<pre>{letter}</pre>

			<div class="actions">
				<button type="button" onclick={copy}>Copy letter</button>
				<button type="button" onclick={download}>Save as .txt</button>
				<button type="button" class="ghost" onclick={clearDraft}>Clear draft</button>
			</div>

			{#if error}
				<p class="error" role="alert">{error}</p>
			{:else if status}
				<p class="status" role="status">{status}</p>
			{:else}
				<p class="status muted">Saved in this browser as you type.</p>
			{/if}
		</section>
	</div>
</main>

<style>
	main {
		max-width: 68rem;
		margin: 0 auto;
		padding: 3rem 1.5rem 4rem;
	}

	header {
		border-bottom: 1px solid var(--rule);
		padding-bottom: 1rem;
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 1.375rem;
	}

	header p {
		margin: 0.25rem 0 0;
		color: var(--ink-soft);
		font-size: 0.9375rem;
	}

	.columns {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 2.5rem;
		align-items: start;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	.meta {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.hint {
		color: var(--ink-faint);
	}

	.output {
		position: sticky;
		top: 2rem;
	}

	.bar {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	h2 {
		font-size: 0.9375rem;
		color: var(--ink-soft);
	}

	.count {
		font-size: 0.8125rem;
		color: var(--ink-faint);
	}

	pre {
		margin: 0;
		font-family: var(--mono);
		font-size: 0.8125rem;
		line-height: 1.7;
		white-space: pre-wrap;
		word-break: break-word;
		background: var(--field);
		border: 1px solid var(--rule);
		border-radius: 3px;
		padding: 1rem 1.1rem;
		max-height: 60vh;
		overflow-y: auto;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.85rem;
		flex-wrap: wrap;
	}

	.ghost {
		margin-left: auto;
		border-color: var(--rule);
		color: var(--ink-soft);
	}

	.error,
	.status {
		font-size: 0.8125rem;
		margin: 0.7rem 0 0;
		min-height: 1.2em;
	}

	.error {
		color: var(--danger);
	}

	.status {
		color: var(--mark);
	}

	.status.muted {
		color: var(--ink-faint);
	}

	@media (max-width: 52rem) {
		main {
			padding-top: 2rem;
		}

		.columns {
			grid-template-columns: minmax(0, 1fr);
			gap: 2rem;
		}

		.output {
			position: static;
		}
	}
</style>
