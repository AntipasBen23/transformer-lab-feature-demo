export interface GPUPricing {
  provider: 'aws' | 'gcp' | 'azure';
  gpuType: string;
  pricePerHour: number;
  memory: string;
  computeCapability: string;
  availability: 'high' | 'medium' | 'low';
}

export const GPU_PRICING: GPUPricing[] = [
  // NVIDIA H100
  {
    provider: 'aws',
    gpuType: 'H100 80GB',
    pricePerHour: 8.10,
    memory: '80GB HBM3',
    computeCapability: '989 TFLOPS',
    availability: 'low'
  },
  {
    provider: 'gcp',
    gpuType: 'H100 80GB',
    pricePerHour: 7.85,
    memory: '80GB HBM3',
    computeCapability: '989 TFLOPS',
    availability: 'low'
  },
  {
    provider: 'azure',
    gpuType: 'H100 80GB',
    pricePerHour: 8.45,
    memory: '80GB HBM3',
    computeCapability: '989 TFLOPS',
    availability: 'medium'
  },
  
  // NVIDIA A100
  {
    provider: 'aws',
    gpuType: 'A100 80GB',
    pricePerHour: 4.10,
    memory: '80GB HBM2e',
    computeCapability: '312 TFLOPS',
    availability: 'high'
  },
  {
    provider: 'gcp',
    gpuType: 'A100 80GB',
    pricePerHour: 3.93,
    memory: '80GB HBM2e',
    computeCapability: '312 TFLOPS',
    availability: 'high'
  },
  {
    provider: 'azure',
    gpuType: 'A100 80GB',
    pricePerHour: 4.25,
    memory: '80GB HBM2e',
    computeCapability: '312 TFLOPS',
    availability: 'high'
  },
  {
    provider: 'aws',
    gpuType: 'A100 40GB',
    pricePerHour: 3.06,
    memory: '40GB HBM2e',
    computeCapability: '312 TFLOPS',
    availability: 'high'
  },
  {
    provider: 'gcp',
    gpuType: 'A100 40GB',
    pricePerHour: 2.93,
    memory: '40GB HBM2e',
    computeCapability: '312 TFLOPS',
    availability: 'high'
  },
  
  // NVIDIA L4
  {
    provider: 'aws',
    gpuType: 'L4 24GB',
    pricePerHour: 1.12,
    memory: '24GB GDDR6',
    computeCapability: '121 TFLOPS',
    availability: 'high'
  },
  {
    provider: 'gcp',
    gpuType: 'L4 24GB',
    pricePerHour: 0.95,
    memory: '24GB GDDR6',
    computeCapability: '121 TFLOPS',
    availability: 'high'
  },
  
  // NVIDIA A10G
  {
    provider: 'aws',
    gpuType: 'A10G 24GB',
    pricePerHour: 1.51,
    memory: '24GB GDDR6',
    computeCapability: '125 TFLOPS',
    availability: 'high'
  },
  {
    provider: 'azure',
    gpuType: 'A10 24GB',
    pricePerHour: 1.48,
    memory: '24GB GDDR6',
    computeCapability: '125 TFLOPS',
    availability: 'high'
  },
  
  // NVIDIA V100
  {
    provider: 'aws',
    gpuType: 'V100 32GB',
    pricePerHour: 3.06,
    memory: '32GB HBM2',
    computeCapability: '125 TFLOPS',
    availability: 'medium'
  },
  {
    provider: 'gcp',
    gpuType: 'V100 16GB',
    pricePerHour: 2.48,
    memory: '16GB HBM2',
    computeCapability: '125 TFLOPS',
    availability: 'medium'
  },
];

export const getGPUPrice = (gpuType: string, provider: string): number => {
  const pricing = GPU_PRICING.find(
    p => p.gpuType === gpuType && p.provider === provider
  );
  return pricing?.pricePerHour || 0;
};

export const getGPUsByProvider = (provider: 'aws' | 'gcp' | 'azure') => {
  return GPU_PRICING.filter(p => p.provider === provider);
};

export const getAllGPUTypes = (): string[] => {
  return [...new Set(GPU_PRICING.map(p => p.gpuType))];
};