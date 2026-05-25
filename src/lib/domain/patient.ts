import type { CaseData } from '$lib/types';
import type { Recommendation } from './rec-types';

/**
 * Generate warnings/considerations from patient-level factors.
 */
export function patientConsiderations(data: CaseData): Recommendation[] {
	const list: Recommendation[] = [];
	const p = data.patientFactors;

	if (p.bruxism) {
		list.push({
			title: 'Bruxism — ปรับ design รับ load สูง',
			detail:
				'Patient มี bruxism: (1) ใช้ rigid major connector (palatal plate ใน maxilla, lingual plate ใน mandible) (2) avoid wrought-wire ที่ flex มาก — ใช้ cast clasp ที่หนากว่า (3) consider occlusal splint ใส่ตอนกลางคืน (4) abutment ต้องแข็งแรงเป็นพิเศษ — Ante\'s law strict',
			severity: 'warn',
			references: [{ source: 'McCracken\'s RPD Ch.4 — Diagnosis & treatment planning' }]
		});
	}

	if (p.oralHygiene === 'poor') {
		list.push({
			title: 'Oral hygiene แย่ — เสี่ยง periodontal failure',
			detail:
				'OH poor: (1) เลื่อนใส่ RPD ออกไปจนกว่า hygiene จะดีขึ้น (2) ใช้ design ที่ปกปิด soft tissue น้อยที่สุด: avoid lingual plate ถ้าทำได้ (3) sharp cleaning instructions (4) monitor recall every 3-6 เดือน',
			severity: 'danger',
			references: []
		});
	} else if (p.oralHygiene === 'fair') {
		list.push({
			title: 'Oral hygiene ปานกลาง — ต้อง education',
			detail:
				'OH fair: เน้น hygiene instruction; ใช้ design ที่ทำความสะอาดง่าย; minor connector ห่าง gingiva 3 mm; recall ทุก 6 เดือน',
			severity: 'warn',
			references: []
		});
	}

	if (p.occlusion === 'deepBite') {
		list.push({
			title: 'Deep bite — ระวัง anterior load + rest seat',
			detail:
				'Deep bite: ฟันหน้าโดน load มาก; ถ้ามี anterior pontic จะรับแรงตลอด function; consider opening VDO ก่อน หรือใช้ metal occlusal บนฟันปลอม; cingulum rest บน canine ต้องลึกพอเพื่อ stability',
			severity: 'warn',
			references: []
		});
	}
	if (p.occlusion === 'openBite') {
		list.push({
			title: 'Open bite — anterior pontic ไม่ contact',
			detail:
				'Anterior open bite: anterior pontic จะไม่ใน occlusal contact → load บนฟันหน้าน้อย → design Class IV ทำได้ปลอดภัยขึ้น; แต่ esthetic อาจประหลาด — patient communication',
			severity: 'info',
			references: []
		});
	}
	if (p.occlusion === 'crossBite') {
		list.push({
			title: 'Cross bite — ระวัง lateral force บน abutment',
			detail:
				'Cross bite: lateral force เข้า abutment ในทิศที่ไม่ปกติ; ตรวจ guide plane direction และ clasp arm position ให้สอดคล้อง; พิจารณา balanced occlusion setup',
			severity: 'warn',
			references: []
		});
	}

	if (p.highSmileLine) {
		list.push({
			title: 'High smile line — esthetic priority สูงสุด',
			detail:
				'Patient โชว์ gingiva ขณะยิ้ม: หลีกเลี่ยง clasp ในโซน esthetic อย่างเด็ดขาด; ใช้ rotational path, reverse Akers ที่ posterior, lingual clasp, หรือ attachment; พิจารณา flange less denture แบบ esthetic',
			severity: 'warn',
			references: [{ source: 'Phoenix RD. Stewart\'s RPD (4th ed.) — Esthetic considerations' }]
		});
	}

	if (p.maxillaryTorus) {
		list.push({
			title: 'Maxillary torus — major connector design',
			detail:
				'Torus palatinus: (1) ถ้า small → AP palatal strap หลบ torus (2) ถ้า large → U-shaped (horseshoe) connector แต่ rigidity ลด (3) ถ้า torus คลุม midline → consider surgical removal ก่อน RPD',
			severity: 'warn',
			references: [{ source: 'McCracken\'s RPD Ch.5 — Major connectors' }]
		});
	}

	if (p.mandibularTori) {
		list.push({
			title: 'Mandibular tori — relief หรือ surgical',
			detail:
				'Tori mandibularis: (1) small → relief connector (2) large/symptomatic → surgical removal ก่อน RPD; lingual bar อาจไม่ contact ridge ถ้า tori ดัน',
			severity: 'warn',
			references: []
		});
	}

	// ---- New factors (Phase B) ----

	if (p.age >= 70) {
		list.push({
			title: `อายุ ${p.age} ปี — senior considerations`,
			detail:
				'Senior patient: (1) dexterity ลด → ออกแบบ clasps ที่ใส่/ถอดง่าย หลีกเลี่ยง small components (2) bone resorption ridge เร็ว → reline schedule 1-2 ปี (3) periodontal compromise มากขึ้น → splinting ถ้าทำได้ (4) cognitive — instructions ชัดเจน + caregiver involvement',
			severity: 'info',
			references: [{ source: 'Felton DA et al. Evidence-based guidelines for the care and maintenance of complete dentures.', page: 'J Prosthodont 2011' }]
		});
	}

	if (p.salivaryFlow === 'reduced') {
		list.push({
			title: 'Salivary flow ลด — retention + ulcer risk',
			detail:
				'Reduced salivary flow: (1) suction retention ของ denture base ลดลง → ใส่ใจ direct retainers + close adaptation (2) เพิ่ม mucosal trauma → ปรับ flange edges ให้เรียบ (3) แนะนำ salivary substitute + sip water (4) caries risk เพิ่ม → fluoride',
			severity: 'warn',
			references: [{ source: 'Plemons JM et al. Managing xerostomia and salivary gland hypofunction.', page: 'J Am Dent Assoc 2014' }]
		});
	}
	if (p.salivaryFlow === 'xerostomia') {
		list.push({
			title: '⚠ Xerostomia — major retention challenge',
			detail:
				'Severe dry mouth: (1) conventional RPD retention ไม่ดี → พิจารณา implant-assisted, attachment-retained (2) high caries risk → daily fluoride trays (3) Sjögren\'s/cancer therapy/medication review → consult MD (4) ผู้ป่วยต้อง expect ปัญหา discomfort + frequent adjustments',
			severity: 'danger',
			references: [{ source: 'Plemons JM et al. JADA 2014' }]
		});
	}

	if (p.tmjStatus === 'clicking') {
		list.push({
			title: 'TMJ clicking — balanced occlusion important',
			detail:
				'TMJ clicking: (1) ใช้ balanced occlusion (group function หรือ canine guidance) (2) avoid อ่าน occlusal interferences ใหม่ (3) consider centric relation mounting (4) monitor symptoms ตลอด treatment',
			severity: 'info',
			references: []
		});
	}
	if (p.tmjStatus === 'pain' || p.tmjStatus === 'limited') {
		list.push({
			title: `⚠ TMJ ${p.tmjStatus === 'pain' ? 'pain' : 'limited opening'} — manage before RPD`,
			detail:
				'TMJ disorder ต้องแก้ก่อน: (1) splint therapy 8-12 weeks (2) เมื่อ stable ใส่ RPD ที่ balanced occlusion, ไม่มี interference (3) monitor symptoms (4) impression + bite registration อาจยากเพราะ limited opening',
			severity: 'warn',
			references: [{ source: 'Okeson JP. Management of Temporomandibular Disorders and Occlusion (8th ed.)' }]
		});
	}

	if (p.skeletalClass === 'class2') {
		list.push({
			title: 'Skeletal Class II — anterior overload risk',
			detail:
				'Class II overjet: ฟันหน้าบนยื่น, anterior pontics ของ RPD บนรับ load มากขึ้นเมื่อบดเคี้ยว → reinforce anterior segment, indirect retainer สำคัญมาก',
			severity: 'info',
			references: []
		});
	}
	if (p.skeletalClass === 'class3') {
		list.push({
			title: 'Skeletal Class III — cross bite + load distribution',
			detail:
				'Class III: ฟันล่างยื่นกว่า → ฟันบนรับ shear force ทาง labial; anterior teeth ของ maxillary RPD อาจ contact ใน reverse pattern → ออกแบบ occlusion ให้ stable, อาจต้อง balanced setup',
			severity: 'info',
			references: []
		});
	}

	if (p.tongueSize === 'large') {
		list.push({
			title: 'Tongue ใหญ่ — mandibular connector clearance',
			detail:
				'Large tongue: (1) lingual bar อาจถูกดันออก → ใช้ lingual plate ที่ stable กว่า (2) avoid excessive lingual extension (3) impressions: ใช้ functional impression เพื่อ record tongue movement',
			severity: 'warn',
			references: []
		});
	}
	if (p.tongueSize === 'small') {
		list.push({
			title: 'Tongue เล็ก — denture stability ลด',
			detail:
				'Small/recessed tongue: lingual seal ไม่ดี → mandibular denture stability ลดลง; พิจารณา wider lingual flange + ต้อง teach patient tongue position techniques',
			severity: 'info',
			references: []
		});
	}

	if (p.frenumAttachment === 'high') {
		list.push({
			title: 'High frenum — flange clearance',
			detail:
				'High frenum attachment: denture flange ต้อง notch หลบ frenum 2-3 mm กว้าง; ถ้าทำ frenum ดึง denture หลุดทุกครั้งที่พูด → frenectomy ก่อน RPD',
			severity: 'warn',
			references: []
		});
	}

	if (p.metalAllergy !== 'none') {
		list.push({
			title: `Metal allergy: ${p.metalAllergy} — framework material restriction`,
			detail:
				p.metalAllergy === 'multiple'
					? 'Multiple metal allergy → CAD-CAM PEEK framework หรือ Valplast thermoplastic (caveats) — ไม่ใช้ Co-Cr/Ti'
					: p.metalAllergy === 'nickel'
						? 'Nickel allergy → ใช้ Ti หรือ Ni-free Co-Cr (เช่น Wironit extra-hard); patch test ก่อนยืนยัน'
						: 'Co-Cr allergy → ใช้ commercially pure Ti หรือ Ti-6Al-4V framework; ค่าใช้จ่ายสูงขึ้น',
			severity: 'warn',
			references: [{ source: 'Kerosuo H et al. Metal allergy and removable prosthodontics.', page: 'J Prosthet Dent 1996' }]
		});
	}

	return list;
}
