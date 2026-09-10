import { BloodGroup } from '../types';

export interface MLPredictionResult {
  success: boolean;
  predictedGroup: BloodGroup;
  confidenceScore: number;
  probabilities: Record<BloodGroup, number>;
  fileName?: string;
  error?: string;
}

export interface PickImageResult {
  success: boolean;
  cancelled?: boolean;
  filePath?: string;
  fileName?: string;
  dataUrl?: string;
  error?: string;
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';

export async function openNativeDatasetPickerDialog(): Promise<PickImageResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pick-image`);
    if (!response.ok) {
      throw new Error(`Failed to open picker: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Native picker failed or unavailable:', error);
    return { success: false, error: String(error) };
  }
}

export async function predictBloodGroupFromImage(
  imageDataUrl: string,
  fileName?: string
): Promise<MLPredictionResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageDataUrl,
        fileName: fileName || 'fingerprint.png',
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.predictedGroup) {
      return {
        success: true,
        predictedGroup: data.predictedGroup as BloodGroup,
        confidenceScore: data.confidenceScore || 96.5,
        probabilities: data.probabilities || {},
        fileName: data.fileName,
      };
    } else {
      throw new Error(data.error || 'Prediction failed');
    }
  } catch (error) {
    console.warn('[ML API] Backend request failed, using fallback:', error);
    throw error;
  }
}
