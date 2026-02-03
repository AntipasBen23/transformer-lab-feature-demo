export interface Experiment {
  id: string;
  name: string;
  modelName: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  gpuType: string;
  provider: 'aws' | 'gcp' | 'azure';
  numGPUs: number;
  startTime: Date;
  endTime?: Date;
  durationHours: number;
  totalCost: number;
  costPerHour: number;
  
  // Performance metrics
  initialAccuracy: number;
  finalAccuracy: number;
  accuracyGain: number;
  
  // Training details
  epochs: number;
  batchSize: number;
  learningRate: number;
  datasetSize: string;
  
  // Team info
  researcher: string;
  team: string;
  project: string;
  
  // Cost breakdown
  computeCost: number;
  storageCost: number;
  networkCost: number;
  
  // Efficiency metrics
  avgGPUUtilization: number;
  costPerAccuracyPoint: number;
  roi: number;
}

export interface EpochMetrics {
  epoch: number;
  cost: number;
  accuracy: number;
  loss: number;
  duration: number; // minutes
  gpuUtilization: number;
}

const researchers = [
  'Sarah Chen',
  'Marcus Rodriguez', 
  'Aisha Patel',
  'James Kim',
  'Elena Volkov',
  'David Okonkwo',
  'Mei Zhang',
  'Lucas Silva'
];

const teams = ['Research', 'Applied AI', 'Platform', 'Foundations'];
const projects = [
  'LLM Fine-tuning',
  'Vision Models',
  'Multimodal Research',
  'RLHF Pipeline',
  'Alignment Research',
  'Safety Testing'
];

const modelNames = [
  'llama-3-70b-instruct',
  'llama-3.1-8b-base',
  'mistral-7b-v0.3',
  'mixtral-8x7b-instruct',
  'phi-3-medium-4k',
  'qwen-2.5-72b',
  'deepseek-v2-lite',
  'gemma-2-27b',
  'yi-34b-chat',
  'falcon-180b'
];

const generateRandomDate = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
};

const generateExperiment = (id: number, daysAgo: number): Experiment => {
  const gpuTypes = ['H100 80GB', 'A100 80GB', 'A100 40GB', 'L4 24GB', 'A10G 24GB'];
  const providers: Array<'aws' | 'gcp' | 'azure'> = ['aws', 'gcp', 'azure'];
  
  const gpuType = gpuTypes[Math.floor(Math.random() * gpuTypes.length)];
  const provider = providers[Math.floor(Math.random() * providers.length)];
  const numGPUs = [1, 2, 4, 8][Math.floor(Math.random() * 4)];
  
  // Cost per hour based on GPU type and provider
  const baseCostPerHour = gpuType.includes('H100') ? 8.0 :
                          gpuType.includes('A100 80GB') ? 4.0 :
                          gpuType.includes('A100 40GB') ? 3.0 : 1.2;
  
  const costPerHour = baseCostPerHour * numGPUs * (provider === 'azure' ? 1.1 : provider === 'aws' ? 1.05 : 1.0);
  
  const durationHours = Math.random() * 48 + 2; // 2-50 hours
  const computeCost = costPerHour * durationHours;
  const storageCost = computeCost * 0.05; // 5% of compute
  const networkCost = computeCost * 0.03; // 3% of compute
  const totalCost = computeCost + storageCost + networkCost;
  
  const initialAccuracy = 65 + Math.random() * 20; // 65-85%
  const accuracyGain = Math.random() * 8 + 1; // 1-9% gain
  const finalAccuracy = initialAccuracy + accuracyGain;
  
  const costPerAccuracyPoint = totalCost / accuracyGain;
  const roi = (accuracyGain / totalCost) * 100; // Higher is better
  
  const startTime = generateRandomDate(daysAgo);
  const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
  
  const statuses: Array<'running' | 'completed' | 'failed' | 'queued'> = 
    daysAgo === 0 ? ['running', 'queued'] : ['completed', 'failed'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  const avgGPUUtilization = status === 'failed' ? 15 + Math.random() * 30 : 
                           55 + Math.random() * 35; // 55-90% for success, 15-45% for failure
  
  const modelName = modelNames[Math.floor(Math.random() * modelNames.length)];
  const experimentName = `${modelName.split('-')[0]}-finetune-${id}`;
  
  return {
    id: `exp-${id.toString().padStart(5, '0')}`,
    name: experimentName,
    modelName,
    status: status === 'failed' && Math.random() > 0.3 ? 'completed' : status, // Only 30% fail
    gpuType,
    provider,
    numGPUs,
    startTime,
    endTime: status === 'completed' || status === 'failed' ? endTime : undefined,
    durationHours: parseFloat(durationHours.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    costPerHour: parseFloat(costPerHour.toFixed(2)),
    initialAccuracy: parseFloat(initialAccuracy.toFixed(1)),
    finalAccuracy: parseFloat(finalAccuracy.toFixed(1)),
    accuracyGain: parseFloat(accuracyGain.toFixed(1)),
    epochs: Math.floor(Math.random() * 20) + 5, // 5-25 epochs
    batchSize: [16, 32, 64, 128][Math.floor(Math.random() * 4)],
    learningRate: parseFloat((Math.random() * 0.0005 + 0.00001).toExponential(2)),
    datasetSize: ['50K', '100K', '500K', '1M', '5M'][Math.floor(Math.random() * 5)],
    researcher: researchers[Math.floor(Math.random() * researchers.length)],
    team: teams[Math.floor(Math.random() * teams.length)],
    project: projects[Math.floor(Math.random() * projects.length)],
    computeCost: parseFloat(computeCost.toFixed(2)),
    storageCost: parseFloat(storageCost.toFixed(2)),
    networkCost: parseFloat(networkCost.toFixed(2)),
    avgGPUUtilization: parseFloat(avgGPUUtilization.toFixed(1)),
    costPerAccuracyPoint: parseFloat(costPerAccuracyPoint.toFixed(2)),
    roi: parseFloat(roi.toFixed(2))
  };
};

// Generate 60 experiments over the last 30 days
export const MOCK_EXPERIMENTS: Experiment[] = Array.from({ length: 60 }, (_, i) => {
  const daysAgo = Math.floor((i / 60) * 30); // Spread over 30 days
  return generateExperiment(i + 1, daysAgo);
});

// Generate 3 currently running experiments
export const RUNNING_EXPERIMENTS: Experiment[] = [
  {
    ...generateExperiment(1001, 0),
    status: 'running',
    name: 'llama-3-70b-dpo-training',
    modelName: 'llama-3-70b-instruct',
    gpuType: 'H100 80GB',
    numGPUs: 8,
    durationHours: 12.5,
    totalCost: 810.0,
    researcher: 'Sarah Chen',
    team: 'Research',
    project: 'RLHF Pipeline'
  },
  {
    ...generateExperiment(1002, 0),
    status: 'running',
    name: 'mistral-7b-finetune-medical',
    modelName: 'mistral-7b-v0.3',
    gpuType: 'A100 80GB',
    numGPUs: 2,
    durationHours: 8.2,
    totalCost: 67.28,
    researcher: 'Marcus Rodriguez',
    team: 'Applied AI',
    project: 'LLM Fine-tuning'
  },
  {
    ...generateExperiment(1003, 0),
    status: 'running',
    name: 'phi-3-medium-code-gen',
    modelName: 'phi-3-medium-4k',
    gpuType: 'A100 40GB',
    numGPUs: 1,
    durationHours: 5.7,
    totalCost: 17.67,
    researcher: 'Aisha Patel',
    team: 'Platform',
    project: 'LLM Fine-tuning'
  }
];

// Generate epoch-level metrics for an experiment
export const generateEpochMetrics = (experiment: Experiment): EpochMetrics[] => {
  const epochs: EpochMetrics[] = [];
  const totalEpochs = experiment.epochs;
  const costPerEpoch = experiment.totalCost / totalEpochs;
  const accuracyPerEpoch = experiment.accuracyGain / totalEpochs;
  
  for (let i = 1; i <= totalEpochs; i++) {
    const progress = i / totalEpochs;
    epochs.push({
      epoch: i,
      cost: parseFloat((costPerEpoch * i).toFixed(2)),
      accuracy: parseFloat((experiment.initialAccuracy + (accuracyPerEpoch * i * (1 + Math.random() * 0.2 - 0.1))).toFixed(2)),
      loss: parseFloat((2.5 * Math.exp(-progress * 2) + Math.random() * 0.1).toFixed(4)),
      duration: parseFloat(((experiment.durationHours * 60 / totalEpochs) * (1 + Math.random() * 0.3 - 0.15)).toFixed(1)),
      gpuUtilization: parseFloat((experiment.avgGPUUtilization + (Math.random() * 10 - 5)).toFixed(1))
    });
  }
  
  return epochs;
};

// Helper functions
export const getExperimentById = (id: string): Experiment | undefined => {
  return [...MOCK_EXPERIMENTS, ...RUNNING_EXPERIMENTS].find(exp => exp.id === id);
};

export const getExperimentsByStatus = (status: Experiment['status']): Experiment[] => {
  return MOCK_EXPERIMENTS.filter(exp => exp.status === status);
};

export const getExperimentsByResearcher = (researcher: string): Experiment[] => {
  return MOCK_EXPERIMENTS.filter(exp => exp.researcher === researcher);
};

export const getExperimentsByTeam = (team: string): Experiment[] => {
  return MOCK_EXPERIMENTS.filter(exp => exp.team === team);
};

export const getTotalSpend = (): number => {
  return MOCK_EXPERIMENTS.reduce((sum, exp) => sum + exp.totalCost, 0);
};

export const getAverageROI = (): number => {
  const completedExps = MOCK_EXPERIMENTS.filter(exp => exp.status === 'completed');
  return completedExps.reduce((sum, exp) => sum + exp.roi, 0) / completedExps.length;
};

export { researchers, teams, projects, modelNames };