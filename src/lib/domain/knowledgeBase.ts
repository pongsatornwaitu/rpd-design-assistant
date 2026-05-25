/**
 * Knowledge base of detailed clinical concept explanations.
 * Each entry has a `key` referenced by recommendations, plus expanded mini-textbook content.
 */

export interface KnowledgeEntry {
	key: string;
	title: string;
	summary: string;
	body: string[];
	clinicalPearls: string[];
	citations: string[];
}

const ENTRIES: KnowledgeEntry[] = [
	{
		key: 'rpi',
		title: 'RPI Clasp (Krol 1973) — stress-releasing design',
		summary:
			'RPI = Rest (mesial) + Proximal plate (distal) + I-bar (gingivally approaching). ออกแบบโดย Albert Krol ปี 1973 เพื่อแก้ปัญหา torque บน abutment ของ distal extension RPD',
		body: [
			'**Mechanism:** เมื่อ saddle ฝั่ง distal extension เคลื่อนตัวลง vertical (รับ load บดเคี้ยว), I-bar จะหมุนรอบ mesial rest. การหมุนนี้ทำให้ I-bar เคลื่อนออกจาก undercut แทนที่จะ engage ลึกขึ้น — ลดการถ่าย torque ไปยัง abutment',
			'**Components:**\n• **Mesial occlusal rest** — วาง mesial fossa, ไม่ใช่ distal. รับ load + กำหนด fulcrum line ที่ mesial.\n• **Proximal plate** — แผ่น metal ติด guide plane ที่ distal surface; ทำหน้าที่ reciprocation ขณะใส่/ถอด\n• **I-bar** — bar clasp gingivally-approaching จาก saddle ขึ้นมา engage 0.25 mm undercut ที่ mesio-buccal',
			'**Indications:** Class I/II terminal abutment ที่ไม่ tipped + มี mesio-buccal undercut + vestibule ≥ 4 mm depth (สำหรับ approach arm)',
			'**Contraindications:** Tipped abutment (use RPA), shallow vestibule < 4 mm (use C-clasp), high frenum at site (use T-bar)'
		],
		clinicalPearls: [
			'จำง่ายๆ: "I-bar รั้งจากใต้, mesial rest กดจากบน, proximal plate ดันด้านข้าง"',
			'I-bar tip ต้องอยู่ 3 mm ห่างจาก gingival margin เพื่อป้องกัน plaque retention',
			'Mesial rest seat ลึก 1-1.5 mm เพื่อให้ stable contact เมื่อ saddle เคลื่อน'
		],
		citations: [
			'Krol AJ. Clasp design for extension-base removable partial dentures. J Prosthet Dent. 1973;29(4):408-415',
			"McCracken's RPD (Carr & Brown, 13th ed.) Ch. 11"
		]
	},
	{
		key: 'akers',
		title: 'Akers Clasp (Cast Circumferential)',
		summary:
			'Akers หรือ cast circumferential clasp เป็น direct retainer มาตรฐาน suprabulge approach — retentive arm เริ่มจาก suprabulge แล้ว taper ลง engage infrabulge undercut',
		body: [
			'**Components:**\n• Occlusal rest บน fossa ใกล้ saddle\n• Retentive arm: 2/3 บน suprabulge (rigid) + 1/3 ปลาย infrabulge (flexible)\n• Reciprocal arm: ตรงข้าม, อยู่ suprabulge ตลอด (rigid) — รับ force ตอน insertion/removal',
			'**Indications:** Bounded edentulous saddle (Class III); abutment with undercut 0.25-0.5 mm in suprabulge-to-infrabulge transition',
			'**Contraindications:** Distal extension (use RPI/RPA — no stress release); deep undercut > 0.5 mm (use wrought-wire); esthetic anterior (visible)',
			'**Variants:** Embrasure (double Akers ใน embrasure ระหว่าง 2 abutments), Ring (3/4 circumference สำหรับ lone-standing tipped molar), Back-action (arm มาจาก distal สำหรับ lone premolar)'
		],
		clinicalPearls: [
			'Retentive arm taper จาก 1.5 mm ที่โคน → 0.75 mm ที่ปลาย เพื่อ flex',
			'Reciprocal arm ต้องเริ่ม engage tooth ก่อน retentive arm เพื่อ true reciprocation',
			'Embrasure clasp ต้อง prep occlusal rest ทั้ง 2 ฟัน + interproximal reduction เพื่อ access'
		],
		citations: [
			'Akers PE. The partial denture clasp. Dent Items Interest. 1925;47:11',
			"McCracken's RPD Ch. 6-7"
		]
	},
	{
		key: 'indirect-retention',
		title: 'Indirect Retention — ป้องกัน Rotation รอบ Fulcrum Line',
		summary:
			'Indirect retainer คือ auxiliary rest ที่วางห่างจาก fulcrum line ในทิศ perpendicular เพื่อต้าน rotation ของ RPD รอบแกน fulcrum',
		body: [
			'**หลักการ Physics:** Torque = Force × Perpendicular distance. ยิ่งระยะตั้งฉาก (perpendicular distance) จาก fulcrum line ไปยัง indirect retainer ยิ่งไกล, ยิ่งต้าน rotation ได้ดี',
			'**Class I/II (distal extension):** fulcrum line ผ่าน mesial rests ของ direct retainers (terminal abutments). Indirect retainer วาง **anterior** ต่อ fulcrum (เช่น mesial fossa ของ premolar, cingulum ของ canine)',
			'**Class IV (anterior):** fulcrum line ผ่าน posterior-most rests bilaterally. Indirect retainer วาง **posterior** ต่อ fulcrum (เช่น auxiliary rest บน molar)',
			'**Class III (bounded):** ไม่ต้องการ formal indirect retainer — rests สองข้างของแต่ละ saddle กำหนด fulcrum, ไม่มี rotation tendency',
			'**Components ที่ทำหน้าที่ IR ได้:**\n• Auxiliary occlusal rest\n• Cingulum rest บน canine\n• Continuous bar / Kennedy bar (anterior)\n• Lingual plate (covers cinguli)\n• Properly designed major connector'
		],
		clinicalPearls: [
			'IR ต้องอยู่ห่าง fulcrum ที่สุดเท่าที่ทำได้ + perpendicular กับ fulcrum line',
			'Rest seat ของ IR ต้อง rigid contact (≥ 1 mm depth) เพื่อ stop rotation จริงๆ',
			'IR ไม่ใช่ direct retainer — มันไม่รั้ง denture, แค่ป้องกัน rotation'
		],
		citations: [
			"McCracken's RPD (Carr & Brown, 13th ed.) Ch. 8",
			"Phoenix RD. Stewart's Clinical RPD (4th ed.) Ch. 7"
		]
	},
	{
		key: 'antes-law',
		title: "Ante's Law — Abutment Capacity",
		summary:
			'Ante 1926: "Combined pericemental area (root surface area) ของ abutment teeth ต้อง ≥ pericemental area ของ teeth ที่ถูกแทนที่" — รากของ abutment ต้องใหญ่พอรับ load',
		body: [
			'**Original context:** กฎนี้สร้างขึ้นสำหรับ fixed bridge ไม่ใช่ RPD โดยตรง แต่หลักการรากใหญ่ = รับ load ได้ดี ยังใช้ใน RPD โดยเฉพาะ tooth-supported (Class III/IV)',
			'**Root surface areas (Jepsen 1963, mm²):**\n• Maxillary 1st molar: 433\n• Mandibular 1st molar: 431\n• Maxillary canine: 273\n• Mandibular canine: 268\n• Maxillary 1st premolar: 234\n• Maxillary central incisor: 234\n• Mandibular incisors: 154-168 (smallest)',
			'**Application ใน RPD:**\n• Tooth-supported: strict — sum abutment area ≥ sum pontic area\n• Tissue-supported (Class I/II): relaxed — ridge ช่วยรับ load, แต่ยังควรตรวจ',
			'**ลดประสิทธิภาพ abutment เมื่อ:** prognosis แย่ (×0.3), C:R unfavorable (×0.5), mobility grade 2-3 (×0.2-0.6)'
		],
		clinicalPearls: [
			'2 canines (273+273=546) + 2 1st molars (433+433=866) = 1412 mm² — รองรับ pontics ได้เกือบทั้ง arch',
			'1 incisor = 154 mm² น้อยมาก — ไม่ควรเป็น sole abutment',
			"Ante's law violation ≠ failure แน่ๆ แต่ตัวบ่งชี้ความเสี่ยง"
		],
		citations: [
			'Ante IH. The fundamental principles of abutments. Mich State Dent Soc Bull. 1926;8:14-23',
			'Jepsen A. Root surface area measurements. Acta Odontol Scand. 1963;21:35-46'
		]
	},
	{
		key: 'rotational-path',
		title: 'Rotational Path of Insertion (Jackson 1980)',
		summary:
			'Rotational path = dual-path insertion ที่ใช้สำหรับ esthetic anterior RPD: engage anterior undercut ขณะใส่แล้ว rotate posterior ลงที่',
		body: [
			'**Concept:** path of insertion ≠ path of removal. Anterior segment เข้าก่อนตามแนวเอียง, lock เข้า undercut ของ anterior teeth, แล้ว posterior segment rotate ลงเข้าที่',
			'**Requirements:**\n• Anterior abutment ที่มี **undercut ≥ 0.5 mm** (ไม่ใช่ 0.25 mm) เพราะต้อง engage หนักกว่าปกติ\n• Rigid minor connector ที่ผ่านเหนือ cingulum + ลงไป engage undercut\n• Posterior support (abutment หรือ ridge) สำหรับ stabilize หลัง rotation\n• Path 1 (insertion) ≠ Path 2 (seating); ทั้งคู่ designed ด้วยกัน',
			'**Advantages:** ไม่มี visible clasp ฝั่ง anterior — esthetic สูงสุด, ดีกว่า reverse Akers + lingual rest design',
			'**Disadvantages:** ต้อง precision surveying สูง (dual path); patient ใส่/ถอดยากขึ้น; ถ้าทำผิดจะ unstable; expensive lab work'
		],
		clinicalPearls: [
			'Jackson เรียก dual-path ว่า "kinder, gentler partial" เพราะไม่ trauma เหงือก/lip',
			'ใช้ได้ดีกับ Class IV เล็กๆ (1-3 anterior teeth)',
			'ตรวจ patient dexterity ก่อน — เด็ก/elderly อาจใส่ลำบาก'
		],
		citations: [
			'Jackson TR. The application of rotational paths to removable partial dentures. J Prosthet Dent. 1980;44(3):302-309',
			"McCracken's RPD Ch. 12"
		]
	},
	{
		key: 'kennedy',
		title: 'Kennedy Classification + Applegate Rules',
		summary:
			'Kennedy 1925: แบ่ง partially edentulous arches เป็น 4 classes ตามตำแหน่ง edentulous area. Applegate เพิ่ม 8 rules สำหรับ application',
		body: [
			'**Class I** — Bilateral edentulous areas located **posterior** to the natural teeth (bilateral distal extension)',
			'**Class II** — Unilateral edentulous area located **posterior** to the remaining natural teeth (unilateral distal extension)',
			'**Class III** — Unilateral edentulous area with natural teeth **both anterior and posterior** to it (bounded saddle)',
			'**Class IV** — Single edentulous area located **anterior** to remaining natural teeth **and crossing midline**',
			'**Applegate Rules (สรุป):**\n1. Classification หลังการถอนที่จำเป็น\n2. Third molar ที่ไม่ replace → ไม่นับ\n3. Third molar ที่ใช้เป็น abutment → นับ\n4. Second molar ที่ไม่ replace + opposing arch ก็ไม่มี → ไม่นับ\n5. Most posterior edentulous area determines class\n6. Areas เพิ่มเติม = modification (mod 1, 2, 3...)\n7. Modification count by NUMBER of additional areas, ไม่ใช่ extent\n8. Class IV ไม่มี modification (ถ้ามี additional → class อื่นแทน)'
		],
		clinicalPearls: [
			'Class I + Mod 1 (bilateral distal + 1 anterior bounded) = พบบ่อยที่สุดทาง คลินิก',
			'Class IV ที่ "ขยายมา 1 ซี่" จริงๆ มัก reclassify เป็น Class III Mod ถ้าไม่ crossing midline',
			'Crossing midline = ครอบคลุม 11 และ 21 (max) หรือ 41 และ 31 (man)'
		],
		citations: [
			'Kennedy E. Partial denture construction. Dental Items of Interest. 1925',
			'Applegate OC. Essentials of Removable Partial Denture Prosthesis (3rd ed.)'
		]
	},
	{
		key: 'major-connector',
		title: 'Major Connector Selection',
		summary:
			'Major connector = backbone ของ RPD ที่ join component สองข้างให้เป็นชิ้นเดียว; ต้อง rigid + comfortable + protect periodontium',
		body: [
			'**Maxillary options:**\n• Single palatal strap (Class III bounded) — minimum bulk\n• Anterior-Posterior palatal strap (Class I/II/IV) — high rigidity\n• Palatal plate (heavy load, few abutments) — maximum tissue support\n• U-shaped/horseshoe (large midline torus only) — low rigidity, avoid',
			'**Mandibular options:**\n• Lingual bar (default if vestibule ≥ 8 mm) — comfortable, hygienic\n• Lingual plate (vestibule < 8 mm, OR splint anterior teeth) — covers cinguli\n• Sublingual bar (vestibule 6-8 mm) — alternative to lingual plate\n• Cingulum bar / continuous bar (anterior splinting) — paired with lingual bar',
			'**Space requirements (mandibular):**\n• Lingual bar: 8 mm minimum (3 mm gingival clearance + 4 mm bar height + 1 mm gingival margin)\n• Sublingual bar: 6-8 mm\n• Lingual plate: 4-5 mm\n• Interarch space: ≥ 4 mm vertical พึ่งใช้ bar without dental clearance issue',
			'**Rigidity tests:** ลอง flex bar ด้วยมือ — ไม่ควร flex visible. Co-Cr ที่ใช้ใน framework ต้องหนาตามคู่มือ: minor connector ≥ 1 mm, major connector ≥ 1-1.5 mm'
		],
		clinicalPearls: [
			'Single palatal strap = "easiest to wear" — ลอง first ก่อนเปลี่ยน design ใหญ่ขึ้น',
			'Lingual bar ต้องตรวจ floor of mouth ที่ rest position ไม่ใช่ active',
			'Patient ปาก ผีพ้นพักงั้น (tongue posture) สำคัญต่อ comfort ของ mandibular connector'
		],
		citations: [
			"McCracken's RPD Ch. 5 — Major and Minor Connectors",
			"Phoenix RD. Stewart's RPD Ch. 8"
		]
	},
	{
		key: 'mouth-prep',
		title: 'Mouth Preparation Sequence',
		summary: 'ลำดับการเตรียมช่องปากก่อน final impression ที่ป้องกัน rework + ทำตามหลัก biological priority',
		body: [
			'**Phase 1 — Surgical/Pre-prosthetic** (1-3 เดือน):\n• Extractions ของ poor prognosis teeth\n• Bony recontouring (torus, sharp ridges)\n• Frenectomy ถ้า frenum high',
			'**Phase 2 — Periodontal** (3-6 เดือน):\n• Scaling/root planing + maintenance\n• Surgical pocket therapy ถ้าจำเป็น\n• Splinting mobile teeth',
			'**Phase 3 — Endodontic** (1-2 เดือน):\n• RCT ก่อน crown prep (post + crown structure ต้องอยู่ก่อน rest seat)\n• ไม่ใช่ทำ endo หลัง crown — destroy rest seat ที่ prep แล้ว',
			'**Phase 4 — Orthodontic** (3-12 เดือน ถ้าจำเป็น):\n• Uprighting tipped molars\n• Intrusion supraerupted opposing teeth\n• Closing/opening of spaces',
			'**Phase 5 — Tooth modifications** (1-2 appointments):\n• Surveyed crowns บน abutments ที่ต้อง\n• Guide plane prep (2-3 mm vertical, parallel กับ path of insertion)\n• Rest seat prep (1/3 MD × 1/2 BL × 1-1.5 mm depth, saucer-shaped)\n• Undercut creation/adjustment (composite addition)\n• Enameloplasty บน opposing teeth ถ้า supraerupt',
			'**Phase 6 — Verification** ก่อน final impression:\n• Disocclusion check (no premature contact)\n• Guide plane verify parallel\n• Rest seat smooth + adequate depth\n• Path of insertion confirmed'
		],
		clinicalPearls: [
			'จำง่าย: "Big to small" — start with surgical (irreversible) → ortho → tooth mods (small adjustments last)',
			"Don't prep rest seat before crown placement — สาเหตุของ rework ใหญ่ที่สุด",
			'Final impression ใช้ individual tray + border molding เสมอ'
		],
		citations: [
			"McCracken's RPD Ch. 16",
			"Phoenix RD. Stewart's RPD Ch. 11"
		]
	}
];

export function lookupKnowledge(key: string): KnowledgeEntry | undefined {
	return ENTRIES.find((e) => e.key === key);
}

export function allKnowledgeEntries(): KnowledgeEntry[] {
	return ENTRIES;
}
