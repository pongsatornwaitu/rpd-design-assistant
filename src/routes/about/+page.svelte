<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>เกี่ยวกับ — RPD Design Assistant</title>
</svelte:head>

<TopBar />

<main id="main" class="wrap">
	<a href="{base}/" class="back">← กลับ</a>

	<article class="card doc">
		<h1>เกี่ยวกับ RPD Design Assistant</h1>
		<p class="lead">
			เครื่องมือช่วยตัดสินใจในการออกแบบ Removable Partial Denture
			สำหรับนักศึกษาทันตแพทย์และทันตแพทย์ทั่วไป — ใช้งานบนเบราว์เซอร์
			ไม่ต้องลงโปรแกรม รองรับ offline และเก็บข้อมูลในเครื่องเท่านั้น
		</p>

		<section>
			<h2>ข้อจำกัด</h2>
			<ul>
				<li>
					เป็นเครื่องมือ <strong>การศึกษา/อ้างอิงเบื้องต้น</strong> เท่านั้น —
					การตัดสินใจคลินิกขั้นสุดท้ายเป็นหน้าที่ของทันตแพทย์ผู้รักษา
				</li>
				<li>
					ข้อแนะนำ (recommendation) สร้างจากกฎคลินิกพื้นฐาน — ไม่ทดแทน
					thorough examination, mounted study casts, และ articulator analysis
				</li>
				<li>
					ห้ามใส่ข้อมูลที่ระบุตัวตนผู้ป่วย (ชื่อ-นามสกุลจริง, HN, เลขประจำตัว) —
					ข้อมูลถูกเก็บเฉพาะในเครื่องนี้แต่ยังไม่ผ่าน security audit
				</li>
			</ul>
		</section>

		<section>
			<h2>ที่มาของข้อแนะนำในแอป</h2>
			<dl class="refs">
				<dt>Kennedy Classification + Applegate's Rules</dt>
				<dd>
					Applegate OC. <em>Essentials of Removable Partial Denture Prosthesis</em>.
					3rd ed. — Ch. 3 — Classification
				</dd>

				<dt>Major Connector Design</dt>
				<dd>
					Carr AB, Brown DT. <em>McCracken's Removable Partial Prosthodontics</em>.
					13th ed. Mosby — Ch. 4-5
				</dd>

				<dt>Direct Retainer (Clasp) Selection</dt>
				<dd>
					Phoenix RD, Cagna DR, DeFreest CF.
					<em>Stewart's Clinical Removable Partial Prosthodontics</em>. 4th ed. — Ch. 6
				</dd>

				<dt>Survey & Design Workflow</dt>
				<dd>
					Carr AB, Brown DT. <em>McCracken's RPD</em>. 13th ed. — Ch. 11-12
				</dd>
			</dl>
		</section>

		<section>
			<h2>หลักการที่ใช้ใน Logic</h2>
			<ul>
				<li>
					<strong>Class I</strong> — bilateral distal extension posterior ต่อฟันธรรมชาติ
				</li>
				<li><strong>Class II</strong> — unilateral distal extension</li>
				<li><strong>Class III</strong> — bounded edentulous area</li>
				<li>
					<strong>Class IV</strong> — single anterior edentulous area crossing midline
					(ไม่มี modification)
				</li>
				<li>
					<strong>Modification</strong> — additional edentulous areas (ไม่นับช่องที่กำหนด class)
				</li>
				<li>
					<strong>Applegate's Rule:</strong> ถ้า third molar หายไปและไม่ได้ใส่ทดแทน
					→ ไม่นับเป็น edentulous area (toggle ใน Settings)
				</li>
			</ul>
		</section>

		<section>
			<h2>เทคโนโลยี</h2>
			<p>
				SvelteKit · TypeScript · Tailwind CSS v4 · Zod · IndexedDB ·
				Service Worker (PWA) — เก็บข้อมูลในเครื่องเท่านั้น ไม่มี backend
			</p>
		</section>

		<section>
			<h2>คีย์ลัด</h2>
			<table class="keys">
				<tbody>
					<tr><td><kbd>Click</kbd></td><td>เลือกฟันเพื่อแก้ Survey</td></tr>
					<tr><td><kbd>Shift</kbd> + <kbd>Click</kbd></td><td>สลับ มี ↔ หายไป</td></tr>
					<tr>
						<td><kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd></td>
						<td>เลื่อนระหว่างฟัน</td>
					</tr>
					<tr><td><kbd>Enter</kbd> / <kbd>Space</kbd></td><td>เปิด Survey ของฟัน</td></tr>
					<tr><td><kbd>Del</kbd> / <kbd>Backspace</kbd></td><td>สลับ มี ↔ หายไป</td></tr>
					<tr><td><kbd>Ctrl</kbd> + <kbd>Z</kbd></td><td>ย้อนกลับ</td></tr>
					<tr><td><kbd>Ctrl</kbd> + <kbd>Y</kbd></td><td>ทำซ้ำ</td></tr>
				</tbody>
			</table>
		</section>

		<p class="version">RPD Design Assistant v2 · ออกแบบใหม่จาก v1</p>
	</article>
</main>

<style>
	.wrap {
		max-width: 760px;
		margin: 0 auto;
		padding: 1rem;
	}
	.back {
		display: inline-block;
		font-size: 0.875rem;
		color: var(--color-teal-700);
		text-decoration: none;
		margin-bottom: 0.75rem;
	}
	.back:hover {
		text-decoration: underline;
	}
	.doc {
		padding: 1.5rem 1.75rem;
	}
	h1 {
		font-size: 1.625rem;
		font-weight: 700;
		color: var(--color-teal-800);
		margin-bottom: 0.5rem;
	}
	.lead {
		font-size: 0.9375rem;
		color: var(--color-ink-muted);
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}
	section {
		margin-bottom: 1.75rem;
	}
	h2 {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-ink);
		margin-bottom: 0.625rem;
		padding-bottom: 0.375rem;
		border-bottom: 1px solid var(--color-line);
	}
	ul {
		padding-inline-start: 1.25rem;
	}
	ul li {
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--color-ink);
	}
	strong {
		font-weight: 600;
		color: var(--color-teal-700);
	}
	.refs dt {
		font-weight: 600;
		font-size: 0.875rem;
		margin-top: 0.625rem;
		color: var(--color-ink);
	}
	.refs dd {
		font-size: 0.8125rem;
		margin-inline-start: 0;
		color: var(--color-ink-muted);
		line-height: 1.5;
	}
	em {
		font-style: italic;
		color: var(--color-ink);
	}
	.keys {
		width: 100%;
		font-size: 0.875rem;
	}
	.keys td {
		padding: 0.375rem 0.5rem;
		border-bottom: 1px solid var(--color-line);
	}
	.keys td:first-child {
		width: 40%;
		color: var(--color-ink-muted);
	}
	kbd {
		display: inline-block;
		padding: 0.125rem 0.375rem;
		background: var(--color-surface);
		border: 1px solid var(--color-line);
		border-radius: 0.25rem;
		font-family: ui-monospace, monospace;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-ink);
		box-shadow: 0 1px 0 var(--color-line);
	}
	.version {
		text-align: center;
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		margin-top: 2rem;
	}
</style>
