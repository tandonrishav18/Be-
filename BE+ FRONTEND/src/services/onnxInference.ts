import { BloodGroup } from '../types';

declare global {
  interface Window {
    ort?: any;
  }
}

const LABELS: Record<number, BloodGroup> = {
  0: 'A+',
  1: 'A-',
  2: 'AB+',
  3: 'AB-',
  4: 'B+',
  5: 'B-',
  6: 'O+',
  7: 'O-',
};

let inferenceSession: any = null;
let sessionLoadingPromise: Promise<any> | null = null;

export async function getOnnxSession(): Promise<any> {
  if (inferenceSession) return inferenceSession;
  if (sessionLoadingPromise) return sessionLoadingPromise;

  sessionLoadingPromise = (async () => {
    const ort = window.ort;
    if (!ort) {
      throw new Error('ONNX Runtime Web is loading or unavailable.');
    }

    try {
      console.log('[ONNX Web] Loading ResNet34 model (/model_quantized.onnx)...');
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.simd = true;

      const session = await ort.InferenceSession.create('/model_quantized.onnx', {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });
      inferenceSession = session;
      console.log('[ONNX Web] Model loaded successfully into browser memory!');
      return session;
    } catch (err) {
      console.warn('[ONNX Web] Retrying with /model.onnx:', err);
      const session = await ort.InferenceSession.create('/model.onnx', {
        executionProviders: ['wasm'],
      });
      inferenceSession = session;
      return session;
    } finally {
      sessionLoadingPromise = null;
    }
  })();

  return sessionLoadingPromise;
}

/**
 * Preprocesses an image Data URL into a Float32Array matching Keras ResNet preprocess_input
 * Shape: [1, 256, 256, 3]
 */
async function preprocessImageToFloat32Array(imageDataUrl: string): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      // Draw and resize to 256x256
      ctx.drawImage(img, 0, 0, 256, 256);
      const imgData = ctx.getImageData(0, 0, 256, 256);
      const data = imgData.data; // RGBA uint8 array

      // Allocate Float32 tensor for [1, 256, 256, 3]
      const float32Data = new Float32Array(1 * 256 * 256 * 3);

      // Keras ResNet ImageNet zero-centering with BGR channel order:
      // Channel 0 (B) = B - 103.939
      // Channel 1 (G) = G - 116.779
      // Channel 2 (R) = R - 123.680
      let floatIdx = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        float32Data[floatIdx] = b - 103.939;
        float32Data[floatIdx + 1] = g - 116.779;
        float32Data[floatIdx + 2] = r - 123.68;
        floatIdx += 3;
      }

      resolve(float32Data);
    };
    img.onerror = (e) => reject(new Error('Failed to load image for preprocessing: ' + e));
    img.src = imageDataUrl;
  });
}

export interface InBrowserPredictionResult {
  predictedGroup: BloodGroup;
  confidenceScore: number;
  probabilities: Record<BloodGroup, number>;
}

/**
 * Runs Real ResNet34 AI Inference inside the browser via ONNX Runtime WebAssembly
 */
export async function predictInBrowser(imageDataUrl: string): Promise<InBrowserPredictionResult> {
  const ort = window.ort;
  if (!ort) {
    throw new Error('ONNX Runtime Web not loaded in browser');
  }

  const session = await getOnnxSession();
  const inputTensorData = await preprocessImageToFloat32Array(imageDataUrl);

  const inputTensor = new ort.Tensor('float32', inputTensorData, [1, 256, 256, 3]);
  const inputName = session.inputNames[0] || 'input_image';

  const feeds: Record<string, any> = {};
  feeds[inputName] = inputTensor;

  const results = await session.run(feeds);
  const outputName = session.outputNames[0];
  const outputTensor = results[outputName];
  const outputData = outputTensor.data as Float32Array;

  // The model's dense output layer is already Softmax activation.
  // We clamp any small negative artifacts from quantization and normalize.
  let sumProbs = 0;
  const rawProbs = new Float32Array(8);
  for (let i = 0; i < 8; i++) {
    rawProbs[i] = Math.max(0, outputData[i]);
    sumProbs += rawProbs[i];
  }

  if (sumProbs === 0) sumProbs = 1.0;

  const probs: Record<BloodGroup, number> = {} as any;
  let bestIdx = 0;
  let bestProb = 0;

  for (let i = 0; i < 8; i++) {
    const p = rawProbs[i] / sumProbs;
    const group = LABELS[i];
    probs[group] = parseFloat((p * 100).toFixed(2));
    if (p > bestProb) {
      bestProb = p;
      bestIdx = i;
    }
  }

  const predictedGroup = LABELS[bestIdx];
  const confidenceScore = parseFloat((bestProb * 100).toFixed(2));

  console.log(`[ONNX AI Engine] Evaluated Image -> ${predictedGroup} (${confidenceScore}% confidence)`);

  return {
    predictedGroup,
    confidenceScore,
    probabilities: probs,
  };
}
