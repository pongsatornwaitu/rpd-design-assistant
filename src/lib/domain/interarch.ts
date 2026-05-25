import type { CaseData, FDI } from '$lib/types';
import { archTeeth, type ArchKey } from './spans';

export interface InterarchConcern {
	region: 'anterior' | 'posterior-right' | 'posterior-left' | 'localized';
	mm: number;
	severity: 'info' | 'warn' | 'danger';
	finding: string;
	action: string;
	affectedTeeth?: FDI[];
}

/** Restorative space thresholds (mm), per McCracken Ch.16 + Stewart Ch.4 */
const THRESHOLDS = {
	posterior: { ideal: 8, normal: 6, limited: 4, insufficient: 2 },
	anterior: { ideal: 10, normal: 7, limited: 5 }
} as const;

export function analyzeInterarchSpace(arch: ArchKey, data: CaseData): InterarchConcern[] {
	const concerns: InterarchConcern[] = [];
	const { anteriorMm, posteriorRightMm, posteriorLeftMm } = data.interarch;

	// Posterior right
	concerns.push(...posteriorConcerns('posterior-right', posteriorRightMm, arch));
	// Posterior left
	concerns.push(...posteriorConcerns('posterior-left', posteriorLeftMm, arch));
	// Anterior
	concerns.push(...anteriorConcerns(anteriorMm, arch));

	// Supraerupted teeth — per-tooth (filtered to this arch)
	const supraerupted = archTeeth(arch, true).filter(
		(f) => data.teeth[f].status === 'present' && data.teeth[f].supraerupted
	);
	if (supraerupted.length) {
		concerns.push({
			region: 'localized',
			mm: 0,
			severity: 'warn',
			finding: `ฟัน ${supraerupted.join(', ')} มี supraerupted antagonist — restorative space ตำแหน่งนั้นลดลง`,
			action:
				'พิจารณา enameloplasty ที่ฟันคู่สบ, orthodontic intrusion, หรือ surveyed crown บนฟัน abutment เพื่อสร้าง rest seat clearance',
			affectedTeeth: supraerupted
		});
	}

	return concerns;
}

function posteriorConcerns(
	region: 'posterior-right' | 'posterior-left',
	mm: number,
	_arch: ArchKey
): InterarchConcern[] {
	const t = THRESHOLDS.posterior;
	if (mm >= t.ideal) return [];
	if (mm >= t.normal) {
		return [
			{
				region,
				mm,
				severity: 'info',
				finding: `Posterior interarch ${mm} mm — สบายในการ design (เป้า ≥ ${t.ideal} mm)`,
				action: 'ออกแบบตามมาตรฐานได้'
			}
		];
	}
	if (mm >= t.limited) {
		return [
			{
				region,
				mm,
				severity: 'warn',
				finding: `Posterior interarch ${mm} mm — จำกัด (4-6 mm)`,
				action:
					'พิจารณา enameloplasty opposing tooth; ลดความหนา framework; lingual bar อาจรบกวน — พิจารณา lingual plate แทน; acrylic posterior tooth ต้อง trim สั้น'
			}
		];
	}
	if (mm >= t.insufficient) {
		return [
			{
				region,
				mm,
				severity: 'danger',
				finding: `Posterior interarch ${mm} mm — ไม่พอ (< 4 mm)`,
				action:
					'ต้อง orthodontic intrusion, surveyed crown เพื่อ shorten opposing, หรือ extract opposing supraerupted tooth; rest seat preparation ปกติทำไม่ได้'
			}
		];
	}
	return [
		{
			region,
			mm,
			severity: 'danger',
			finding: `Posterior interarch ${mm} mm — แทบไม่มีพื้นที่`,
			action: 'ไม่สามารถใส่ RPD ตำแหน่งนี้ได้ — ต้องแก้ space ก่อน (extract, intrude, restore VDO)'
		}
	];
}

function anteriorConcerns(mm: number, _arch: ArchKey): InterarchConcern[] {
	const t = THRESHOLDS.anterior;
	if (mm >= t.ideal) return [];
	if (mm >= t.normal) {
		return [
			{
				region: 'anterior',
				mm,
				severity: 'info',
				finding: `Anterior interarch ${mm} mm — ปกติ`,
				action: 'ใส่ฟันปลอมหน้าได้ตามมาตรฐาน'
			}
		];
	}
	if (mm >= t.limited) {
		return [
			{
				region: 'anterior',
				mm,
				severity: 'warn',
				finding: `Anterior interarch ${mm} mm — จำกัด (esthetic อาจสั้น)`,
				action:
					'ฟันปลอมหน้าจะดูสั้นกว่าธรรมชาติ; พิจารณา ortho intrusion ของ opposing teeth หรือ restoration เพื่อปรับ VDO'
			}
		];
	}
	return [
		{
			region: 'anterior',
			mm,
			severity: 'danger',
			finding: `Anterior interarch ${mm} mm — ไม่พอใส่ฟัน esthetic`,
			action:
				'ต้องเพิ่ม restorative space — ortho intrusion opposing, restoration ทาง VDO หรือ surgical crown lengthening'
		}
	];
}
