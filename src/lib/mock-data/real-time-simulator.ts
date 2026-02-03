import { Experiment, RUNNING_EXPERIMENTS } from './experiments';

export interface LiveCostUpdate {
  experimentId: string;
  currentCost: number;
  elapsedTime: number; // in hours
  estimatedTimeRemaining: string;
  currentEpoch: number;
  totalEpochs: number;
  gpuUtilization: number;
  throughput: string; // tokens/sec or samples/sec
}

export interface BudgetAlert {
  id: string;
  type: 'warning' | 'critical' | 'exceeded';
  message: string;
  currentSpend: number;
  budgetLimit: number;
  timestamp: Date;
  experimentId?: string;
}

class RealTimeSimulator {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private startTimes: Map<string, number> = new Map();
  private currentCosts: Map<string, number> = new Map();
  private budgetAlerts: BudgetAlert[] = [];
  
  // Initialize running experiments
  constructor() {
    RUNNING_EXPERIMENTS.forEach(exp => {
      this.startTimes.set(exp.id, Date.now());
      this.currentCosts.set(exp.id, exp.totalCost);
    });
  }

  // Start simulating real-time cost updates
  startSimulation(
    experimentId: string,
    costPerHour: number,
    onUpdate: (update: LiveCostUpdate) => void
  ): void {
    // Clear existing interval if any
    this.stopSimulation(experimentId);

    const experiment = RUNNING_EXPERIMENTS.find(e => e.id === experimentId);
    if (!experiment) return;

    const startTime = this.startTimes.get(experimentId) || Date.now();
    const initialCost = this.currentCosts.get(experimentId) || 0;

    const interval = setInterval(() => {
      const elapsedMs = Date.now() - startTime;
      const elapsedHours = elapsedMs / (1000 * 60 * 60);
      const currentCost = initialCost + (costPerHour * elapsedHours);

      // Simulate progress
      const progress = Math.min(elapsedHours / experiment.durationHours, 1);
      const currentEpoch = Math.min(
        Math.floor(progress * experiment.epochs) + 1,
        experiment.epochs
      );

      // Calculate estimated time remaining
      const remainingHours = Math.max(experiment.durationHours - elapsedHours, 0);
      const etaString = this.formatETA(remainingHours);

      // Simulate GPU utilization fluctuation
      const baseUtilization = experiment.avgGPUUtilization;
      const utilization = Math.max(
        0,
        Math.min(100, baseUtilization + (Math.random() * 10 - 5))
      );

      // Simulate throughput
      const throughput = this.generateThroughput(experiment.modelName);

      const update: LiveCostUpdate = {
        experimentId,
        currentCost: parseFloat(currentCost.toFixed(2)),
        elapsedTime: parseFloat(elapsedHours.toFixed(2)),
        estimatedTimeRemaining: etaString,
        currentEpoch,
        totalEpochs: experiment.epochs,
        gpuUtilization: parseFloat(utilization.toFixed(1)),
        throughput
      };

      this.currentCosts.set(experimentId, currentCost);
      onUpdate(update);
    }, 1000); // Update every second

    this.intervals.set(experimentId, interval);
  }

  // Stop simulation for an experiment
  stopSimulation(experimentId: string): void {
    const interval = this.intervals.get(experimentId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(experimentId);
    }
  }

  // Stop all simulations
  stopAllSimulations(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }

  // Get current cost for an experiment
  getCurrentCost(experimentId: string): number {
    return this.currentCosts.get(experimentId) || 0;
  }

  // Calculate total current spend across all running experiments
  getTotalCurrentSpend(): number {
    return Array.from(this.currentCosts.values()).reduce((sum, cost) => sum + cost, 0);
  }

  // Generate budget alerts
  checkBudgetAlerts(
    currentSpend: number,
    monthlyBudget: number,
    onAlert: (alert: BudgetAlert) => void
  ): void {
    const percentage = (currentSpend / monthlyBudget) * 100;

    // Warning at 75%
    if (percentage >= 75 && percentage < 90) {
      const alert: BudgetAlert = {
        id: `alert-${Date.now()}`,
        type: 'warning',
        message: `You've used ${percentage.toFixed(0)}% of your monthly GPU budget`,
        currentSpend,
        budgetLimit: monthlyBudget,
        timestamp: new Date()
      };
      
      // Only send if we haven't sent this alert recently
      const recentWarning = this.budgetAlerts.find(
        a => a.type === 'warning' && Date.now() - a.timestamp.getTime() < 300000 // 5 min
      );
      
      if (!recentWarning) {
        this.budgetAlerts.push(alert);
        onAlert(alert);
      }
    }

    // Critical at 90%
    if (percentage >= 90 && percentage < 100) {
      const alert: BudgetAlert = {
        id: `alert-${Date.now()}`,
        type: 'critical',
        message: `Critical: ${percentage.toFixed(0)}% of monthly GPU budget used`,
        currentSpend,
        budgetLimit: monthlyBudget,
        timestamp: new Date()
      };
      
      const recentCritical = this.budgetAlerts.find(
        a => a.type === 'critical' && Date.now() - a.timestamp.getTime() < 300000
      );
      
      if (!recentCritical) {
        this.budgetAlerts.push(alert);
        onAlert(alert);
      }
    }

    // Exceeded at 100%
    if (percentage >= 100) {
      const alert: BudgetAlert = {
        id: `alert-${Date.now()}`,
        type: 'exceeded',
        message: `Budget exceeded! Current spend: $${currentSpend.toFixed(2)}`,
        currentSpend,
        budgetLimit: monthlyBudget,
        timestamp: new Date()
      };
      
      const recentExceeded = this.budgetAlerts.find(
        a => a.type === 'exceeded' && Date.now() - a.timestamp.getTime() < 300000
      );
      
      if (!recentExceeded) {
        this.budgetAlerts.push(alert);
        onAlert(alert);
      }
    }
  }

  // Simulate experiment completion
  completeExperiment(experimentId: string, onComplete: (finalCost: number) => void): void {
    this.stopSimulation(experimentId);
    const finalCost = this.currentCosts.get(experimentId) || 0;
    onComplete(finalCost);
  }

  // Format ETA string
  private formatETA(hours: number): string {
    if (hours < 0.017) return 'less than 1 minute'; // < 1 minute
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    }
    if (hours < 24) {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    const days = Math.floor(hours / 24);
    const h = Math.floor(hours % 24);
    return h > 0 ? `${days}d ${h}h` : `${days}d`;
  }

  // Generate realistic throughput based on model
  private generateThroughput(modelName: string): string {
    const baseRate = modelName.includes('70b') ? 120 :
                     modelName.includes('34b') ? 280 :
                     modelName.includes('13b') ? 450 :
                     modelName.includes('7b') ? 850 : 1200;
    
    // Add some variance
    const variance = Math.random() * 0.2 - 0.1; // ±10%
    const rate = Math.round(baseRate * (1 + variance));
    
    return `${rate.toLocaleString()} tokens/sec`;
  }

  // Get all alerts
  getAlerts(): BudgetAlert[] {
    return [...this.budgetAlerts].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  // Clear old alerts (older than 1 hour)
  clearOldAlerts(): void {
    const oneHourAgo = Date.now() - 3600000;
    this.budgetAlerts = this.budgetAlerts.filter(
      alert => alert.timestamp.getTime() > oneHourAgo
    );
  }
}

// Singleton instance
export const realTimeSimulator = new RealTimeSimulator();

// Helper to simulate network delay (for API calls)
export const simulateNetworkDelay = async (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Generate realistic historical cost data for charts
export interface HistoricalCostData {
  date: string;
  totalCost: number;
  experiments: number;
  avgUtilization: number;
}

export const generateHistoricalData = (days: number = 30): HistoricalCostData[] => {
  const data: HistoricalCostData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simulate varying daily costs
    const baseCost = 800 + Math.random() * 400; // $800-$1200/day
    const experiments = Math.floor(Math.random() * 5) + 2; // 2-7 experiments/day
    const avgUtilization = 45 + Math.random() * 35; // 45-80% utilization
    
    data.push({
      date: date.toISOString().split('T')[0],
      totalCost: parseFloat(baseCost.toFixed(2)),
      experiments,
      avgUtilization: parseFloat(avgUtilization.toFixed(1))
    });
  }
  
  return data;
};

// Generate cost projection
export interface CostProjection {
  date: string;
  projectedCost: number;
  confidence: 'high' | 'medium' | 'low';
}

export const generateCostProjection = (
  historicalData: HistoricalCostData[],
  daysToProject: number = 7
): CostProjection[] => {
  // Simple moving average for projection
  const recentDays = historicalData.slice(-7);
  const avgDailyCost = recentDays.reduce((sum, d) => sum + d.totalCost, 0) / recentDays.length;
  
  const projections: CostProjection[] = [];
  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  
  for (let i = 1; i <= daysToProject; i++) {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i);
    
    // Add some variance and trend
    const variance = (Math.random() * 0.3 - 0.15); // ±15%
    const trend = 1 + (i * 0.02); // Slight upward trend
    const projectedCost = avgDailyCost * trend * (1 + variance);
    
    projections.push({
      date: date.toISOString().split('T')[0],
      projectedCost: parseFloat(projectedCost.toFixed(2)),
      confidence: i <= 3 ? 'high' : i <= 5 ? 'medium' : 'low'
    });
  }
  
  return projections;
};