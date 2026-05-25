import type { CaseData, FDI } from '$lib/types';
import { archTeeth, type ArchKey } from './spans';

export interface MouthPrepItem {
	tooth?: FDI;
	step: string;
	detail: string;
	priority: 'high' | 'medium' | 'low';
}

/**
 * Generate ordered mouth preparation checklist.
 * Sequence follows McCracken's Ch.16 Mouth Preparation:
 * 1. Periodontal therapy + extractions (if needed)
 * 2. Endodontic / restorative
 * 3. Orthodontic (uprighting, intrusion)
 * 4. Surveyed crowns
 * 5. Tooth modifications: rest seats, guide planes, undercuts, enameloplasty
 */
export function generateMouthPrep(arch: ArchKey, data: CaseData, abutments: FDI[]): MouthPrepItem[] {
	const items: MouthPrepItem[] = [];

	// 1. Pre-prosthetic surgery / extractions
	const poorAbutments = abutments.filter(
		(f) => data.teeth[f].prognosis === 'poor' || data.teeth[f].crownRoot === 'unfavorable'
	);
	if (poorAbutments.length) {
		items.push({
			step: 'Extraction / Pre-prosthetic',
			detail: `ฟัน ${poorAbutments.join(', ')} prognosis แย่ — พิจารณาถอนก่อนสร้าง RPD เพื่อ ป้องกัน failure ใน 1-2 ปี`,
			priority: 'high'
		});
	}

	const mobileAbutments = abutments.filter((f) => {
		const m = data.teeth[f].mobility;
		return m === 'grade2' || m === 'grade3';
	});
	if (mobileAbutments.length) {
		items.push({
			step: 'Periodontal therapy',
			detail: `ฟัน ${mobileAbutments.join(', ')} mobile grade 2-3 — ต้อง periodontal therapy + splinting หรือพิจารณาถอน ก่อนใช้เป็น abutment`,
			priority: 'high'
		});
	}

	// 2. Endodontic evaluation — questionable prognosis abutments that may need RCT before crown
	const endoCandidates = abutments.filter((f) => {
		const s = data.teeth[f];
		// abutment with questionable prognosis or needs surveyed crown → evaluate pulp
		return s.prognosis === 'questionable' || s.surveyedCrown;
	});
	if (endoCandidates.length) {
		items.push({
			step: 'Endodontic evaluation',
			detail: `ฟัน ${endoCandidates.join(', ')} prognosis น่าสงสัย/ต้อง surveyed crown → ประเมิน pulp vitality + periapical ก่อน: (1) ถ้า pulp involvement → RCT ก่อนทำ crown (2) clinical crown สั้น + rest seat ลึก อาจ expose pulp → preventive RCT พิจารณา (3) DO endo BEFORE crown prep, ไม่ใช่หลัง — เพราะ access cavity ของ post-crown RCT จะทำลาย rest seat`,
			priority: 'high'
		});
	}

	// 3. Orthodontic uprighting for tipped abutments
	const tipped = abutments.filter((f) => data.teeth[f].tipped);
	if (tipped.length) {
		items.push({
			step: 'Orthodontic uprighting',
			detail: `ฟัน ${tipped.join(', ')} tipped — แก้ด้วย orthodontic uprighting (ใช้เวลา 3-6 เดือน) หรือ surveyed crown เพื่อปรับ height of contour ก่อนทำ rest seat`,
			priority: 'high'
		});
	}

	// 3. Supraeruption — enameloplasty on opposing
	const supraerupted = archTeeth(arch, true).filter(
		(f) => data.teeth[f].status === 'present' && data.teeth[f].supraerupted
	);
	if (supraerupted.length) {
		items.push({
			step: 'Enameloplasty / Intrusion (opposing arch)',
			detail: `Antagonist ของฟัน ${supraerupted.join(', ')} supraerupted — ลด occlusal height ด้วย enameloplasty (ถ้าไม่เกิน 2 mm) หรือ orthodontic intrusion / extraction (ถ้ามากกว่า)`,
			priority: 'medium'
		});
	}

	// 4. Surveyed crown indications
	const needCrown = abutments.filter((f) => data.teeth[f].surveyedCrown);
	if (needCrown.length) {
		items.push({
			step: 'Surveyed crown',
			detail: `ฟัน ${needCrown.join(', ')} ต้อง surveyed crown — เพื่อสร้าง ideal contour: guide plane, rest seat, undercut location/depth ตามที่ออกแบบ`,
			priority: 'medium'
		});
	}

	// 5. Guide plane preparation
	const noGuide = abutments.filter((f) => data.teeth[f].guidePlane === 'absent');
	const partialGuide = abutments.filter((f) => data.teeth[f].guidePlane === 'partial');
	if (noGuide.length) {
		items.push({
			step: 'Guide plane preparation',
			detail: `ฟัน ${noGuide.join(', ')} ไม่มี guide plane — กรอ proximal surface ที่ขนานกับ path of insertion (~2-3 mm vertical, ตาม occlusogingival)`,
			priority: 'medium'
		});
	}
	if (partialGuide.length) {
		items.push({
			step: 'Guide plane completion',
			detail: `ฟัน ${partialGuide.join(', ')} guide plane ไม่สมบูรณ์ — refine ให้ขนานกับ path of insertion`,
			priority: 'low'
		});
	}

	// 6. Rest seat preparation
	if (abutments.length) {
		items.push({
			step: 'Rest seat preparation',
			detail: `เตรียม rest seat บน abutments ${abutments.join(', ')} — ขนาด: 1/3 mesiodistal × 1/2 buccolingual × 1-1.5 mm depth; saucer-shaped, round edges, smooth`,
			priority: 'medium'
		});
	}

	// 7. Undercut adjustment
	const noUndercut = abutments.filter((f) => data.teeth[f].undercutDepthMm === 0);
	const shallowUndercut = abutments.filter(
		(f) => data.teeth[f].undercutDepthMm > 0 && data.teeth[f].undercutDepthMm < 0.25
	);
	if (noUndercut.length || shallowUndercut.length) {
		const fdis = [...noUndercut, ...shallowUndercut].sort((a, b) => a - b);
		items.push({
			step: 'Undercut creation',
			detail: `ฟัน ${fdis.join(', ')} undercut ไม่พอ (< 0.25 mm) — สร้าง undercut ด้วย composite addition หรือ surveyed crown — เป้า 0.25 mm สำหรับ cast clasp, 0.5 mm สำหรับ wrought-wire`,
			priority: 'medium'
		});
	}

	// 8. Disocclusion / occlusal check
	items.push({
		step: 'Disocclusion + occlusal verification',
		detail:
			'หลัง prep และก่อน final impression: ตรวจ disocclusion check — (1) วาง articulating paper ระหว่าง prep sites และ opposing dentition (2) confirm rest seat ไม่ premature contact (3) guide plane ไม่รบกวน excursive movement (4) ถ้ามี interference → adjust ก่อน impression; ใช้ shimstock 8μm verify clearance',
		priority: 'medium'
	});

	// 9. Final impression note
	items.push({
		step: 'Final impression',
		detail:
			'หลัง mouth prep ครบ + disocclusion check → final impression: ใช้ individual tray + border molding; ถ้ามี distal extension ใช้ altered cast technique (functional impression) เพื่อ ridge contact ที่ดี',
		priority: 'low'
	});

	return items;
}
