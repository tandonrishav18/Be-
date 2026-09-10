import { BloodGroup, FingerprintPattern } from '../types';

export interface BloodGroupDetails {
  group: BloodGroup;
  antigens: string[];
  antibodies: string[];
  rhFactor: 'Positive (+)' | 'Negative (-)';
  canDonateTo: BloodGroup[];
  canReceiveFrom: BloodGroup[];
  prevalence: string;
  clinicalSummary: string;
  dermatoglyphicAffinity: string;
}

export const BLOOD_GROUP_DATA: Record<BloodGroup, BloodGroupDetails> = {
  'O+': {
    group: 'O+',
    antigens: ['Rh (D) Antigen'],
    antibodies: ['Anti-A', 'Anti-B'],
    rhFactor: 'Positive (+)',
    canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O+', 'O-'],
    prevalence: '~38% of population (Most common)',
    clinicalSummary: 'Contains Rh factor on red cells, with Anti-A and Anti-B antibodies present in plasma. Key emergency donor group for Rh+ recipients.',
    dermatoglyphicAffinity: 'High prevalence of Ulnar Loops (62%) and balanced ridge density (14-17 ridges/cm).'
  },
  'O-': {
    group: 'O-',
    antigens: ['None (No A, B, or Rh antigens)'],
    antibodies: ['Anti-A', 'Anti-B', 'Anti-D (if sensitized)'],
    rhFactor: 'Negative (-)',
    canDonateTo: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    canReceiveFrom: ['O-'],
    prevalence: '~7% of population (Universal Red Cell Donor)',
    clinicalSummary: 'Universal erythrocyte donor. Red blood cells carry no A, B, or Rh surface antigens, avoiding acute hemolytic transfusion reactions.',
    dermatoglyphicAffinity: 'Associated with higher frequency of Plain Arches and lower total finger ridge count.'
  },
  'A+': {
    group: 'A+',
    antigens: ['A Antigen', 'Rh (D) Antigen'],
    antibodies: ['Anti-B'],
    rhFactor: 'Positive (+)',
    canDonateTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    prevalence: '~34% of population (Second most common)',
    clinicalSummary: 'A antigens present on RBC membrane with Anti-B antibodies in serum. Compatible with A and O blood fractions.',
    dermatoglyphicAffinity: 'Prominent Ulnar Loop patterns and moderate Whorl occurrences with stable ridge spacing.'
  },
  'A-': {
    group: 'A-',
    antigens: ['A Antigen'],
    antibodies: ['Anti-B'],
    rhFactor: 'Negative (-)',
    canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
    canReceiveFrom: ['A-', 'O-'],
    prevalence: '~6% of population',
    clinicalSummary: 'Can donate red blood cells to A and AB recipients irrespective of Rh factor, but can only receive Rh-negative blood.',
    dermatoglyphicAffinity: 'Increased frequency of Tented Arches and lower minutiae bifurcation density.'
  },
  'B+': {
    group: 'B+',
    antigens: ['B Antigen', 'Rh (D) Antigen'],
    antibodies: ['Anti-A'],
    rhFactor: 'Positive (+)',
    canDonateTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    prevalence: '~9% of population',
    clinicalSummary: 'B surface antigens with serum Anti-A antibodies. Universal plasma recipient for B and AB matches.',
    dermatoglyphicAffinity: 'Demonstrates elevated frequency of Whorl patterns (both concentric and spiral types).'
  },
  'B-': {
    group: 'B-',
    antigens: ['B Antigen'],
    antibodies: ['Anti-A'],
    rhFactor: 'Negative (-)',
    canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
    canReceiveFrom: ['B-', 'O-'],
    prevalence: '~2% of population (Rare)',
    clinicalSummary: 'Can safely donate to B and AB recipients. Highly valuable for negative blood matching banks.',
    dermatoglyphicAffinity: 'Displays distinctive radial loop patterns and higher variance in core-to-delta ridge counting.'
  },
  'AB+': {
    group: 'AB+',
    antigens: ['A Antigen', 'B Antigen', 'Rh (D) Antigen'],
    antibodies: ['None in serum'],
    rhFactor: 'Positive (+)',
    canDonateTo: ['AB+'],
    canReceiveFrom: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    prevalence: '~3% of population (Universal Recipient)',
    clinicalSummary: 'Universal recipient of all red blood cells. RBCs express A, B, and Rh antigens, meaning no ABO or Rh antibodies attack incoming cells.',
    dermatoglyphicAffinity: 'Highest statistical correlation with True Whorl and Composite/Accidental patterns.'
  },
  'AB-': {
    group: 'AB-',
    antigens: ['A Antigen', 'B Antigen'],
    antibodies: ['None in serum'],
    rhFactor: 'Negative (-)',
    canDonateTo: ['AB+', 'AB-'],
    canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    prevalence: '~1% of population (Rarest group)',
    clinicalSummary: 'Rarest ABO phenotype. Universal donor for clinical plasma transfusions.',
    dermatoglyphicAffinity: 'Features complex composite dermatoglyphics with twin loops and distinctive minutiae clusters.'
  }
};

export const PATTERN_LABELS: Record<FingerprintPattern, { name: string; description: string }> = {
  whorl: {
    name: 'Whorl (Spiral/Concentric)',
    description: 'Circular ridges around a core point with two distinct triradii (deltas).'
  },
  loop_ulnar: {
    name: 'Ulnar Loop',
    description: 'Ridges enter and exit toward the ulnar bone (little finger direction).'
  },
  loop_radial: {
    name: 'Radial Loop',
    description: 'Ridges enter and exit toward the radius bone (thumb direction).'
  },
  arch_plain: {
    name: 'Plain Arch',
    description: 'Ridges enter from one side and flow out smoothly to the other with slight elevation.'
  },
  arch_tented: {
    name: 'Tented Arch',
    description: 'Ridges form a sharp spike or tent-like thrust at the center core.'
  },
  composite: {
    name: 'Composite / Twin Loop',
    description: 'Combination of two distinct loop formations or irregular double-core ridges.'
  }
};
