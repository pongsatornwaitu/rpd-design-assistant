import type { CaseData } from '$lib/types';
import { classifyKennedy } from './kennedy';
import { analyzeArch, type ArchAnalysis } from './recommendations';
import { selectMaterials, type MaterialChoice } from './materials';
import { analyzeEsthetic } from './esthetic';
import { findMissingSpans } from './spans';

export interface CaseAnalysis {
	maxilla: ArchAnalysis;
	mandible: ArchAnalysis;
	materials: MaterialChoice;
}

export function analyzeCase(data: CaseData, includeThirdMolars = false): CaseAnalysis {
	const maxClass = classifyKennedy('maxilla', data, includeThirdMolars);
	const manClass = classifyKennedy('mandible', data, includeThirdMolars);
	const maxAnalysis = analyzeArch('maxilla', data, maxClass, includeThirdMolars);
	const manAnalysis = analyzeArch('mandible', data, manClass, includeThirdMolars);

	// Material selection — use whichever arch has more design considerations
	const refEsthetic =
		maxAnalysis.esthetic.tier !== 'no-anterior-loss'
			? maxAnalysis.esthetic
			: manAnalysis.esthetic;
	const isToothSupported =
		(maxClass.className === 'III' || maxClass.className === 'IV') &&
		(manClass.className === 'III' || manClass.className === 'IV');

	return {
		maxilla: maxAnalysis,
		mandible: manAnalysis,
		materials: selectMaterials(data, refEsthetic, isToothSupported)
	};
}

export * from './kennedy';
export * from './spans';
export * from './recommendations';
export type { MaterialChoice } from './materials';
