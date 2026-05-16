import type { CaseData } from '$lib/types';
import { classifyKennedy } from './kennedy';
import { analyzeArch, type ArchAnalysis } from './recommendations';

export interface CaseAnalysis {
	maxilla: ArchAnalysis;
	mandible: ArchAnalysis;
}

export function analyzeCase(data: CaseData, includeThirdMolars = false): CaseAnalysis {
	const maxClass = classifyKennedy('maxilla', data, includeThirdMolars);
	const manClass = classifyKennedy('mandible', data, includeThirdMolars);
	return {
		maxilla: analyzeArch('maxilla', data, maxClass, includeThirdMolars),
		mandible: analyzeArch('mandible', data, manClass, includeThirdMolars)
	};
}

export * from './kennedy';
export * from './spans';
export * from './recommendations';
