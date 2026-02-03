'use client';

import { useEffect, useState } from 'react';
import { MOCK_EXPERIMENTS, RUNNING_EXPERIMENTS, getTotalSpend } from '@/lib/mock-data/experiments';
import { realTimeSimulator, LiveCostUpdate, generateHistoricalData } from '@/lib/mock-data/real-time-simulator';
import { formatCurrency, formatPercent, getRelativeTime } from '@/lib/utils/formatters';

export default function DashboardPage() {
  const [totalSpend, setTotalSpend] = useState(getTotalSpend());
  const [runningCosts, setRunningCosts] = useState<Map<string, number>>(new Map());
  const [liveUpdates, setLiveUpdates] = useState<Map<string, LiveCostUpdate>>(new Map());
  const [monthlyBudget] = useState(50000); // $50k monthly budget
  const [historicalData] = useState(generateHistoricalData(30));

  // Calculate current total with running experiments
  const currentTotalSpend = totalSpend + Array.from(runningCosts.values()).reduce((sum, cost) => sum + cost, 0);
  const budgetUsed = (currentTotalSpend / monthlyBudget) * 100;

  // Start real-time simulation for running experiments
  useEffect(() => {
    RUNNING_EXPERIMENTS.forEach(exp => {
      realTimeSimulator.startSimulation(
        exp.id,
        exp.costPerHour,
        (update) => {
          setLiveUpdates(prev => new Map(prev).set(exp.id, update));
          setRunningCosts(prev => new Map(prev).set(exp.id, update.currentCost));
        }
      );
    });

    return () => {
      realTimeSimulator.stopAllSimulations();
    };
  }, []);

  // Calculate stats
  const completedExperiments = MOCK_EXPERIMENTS.filter(e => e.status === 'completed');
  const avgCost = completedExperiments.reduce((sum, e) => sum + e.totalCost, 0) / completedExperiments.length;
  const avgUtilization = completedExperiments.reduce((sum, e) => sum + e.avgGPUUtilization, 0) / completedExperiments.length;

  // Get top 5 most expensive experiments
  const topExpensive = [...MOCK_EXPERIMENTS]
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 5);

  // Get best ROI experiments
  const bestROI = [...completedExperiments]
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-purple-900/30 bg-[#0a0a0f]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-white">GPU Spend Intelligence</h1>
                <p className="text-xs text-purple-400">Transformer Lab Extension</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Connected to Transformer Lab v2.1.0
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Spend */}
          <div className="bg-[#13131a] border border-purple-800/30 rounded-xl p-6">
            <div className="text-sm text-purple-400 mb-1">Total Spend (30 days)</div>
            <div className="text-3xl font-bold text-white mb-2">
              {formatCurrency(currentTotalSpend)}
            </div>
            <div className="text-xs text-gray-400">
              Budget: {formatCurrency(monthlyBudget)} ({formatPercent(budgetUsed)} used)
            </div>
            <div className="mt-3 h-2 bg-[#1a1a24] rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  budgetUsed >= 90 ? 'bg-red-500' : budgetUsed >= 75 ? 'bg-amber-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}
                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
              />
            </div>
          </div>

          {/* Running Experiments */}
          <div className="bg-[#13131a] border border-purple-800/30 rounded-xl p-6">
            <div className="text-sm text-purple-400 mb-1">Running Experiments</div>
            <div className="text-3xl font-bold text-white mb-2">
              {RUNNING_EXPERIMENTS.length}
            </div>
            <div className="text-xs text-gray-400">
              Current cost: {formatCurrency(Array.from(runningCosts.values()).reduce((sum, cost) => sum + cost, 0))}
            </div>
            <div className="mt-3 flex items-center gap-1">
              {RUNNING_EXPERIMENTS.map(exp => (
                <div key={exp.id} className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              ))}
            </div>
          </div>

          {/* Average Cost */}
          <div className="bg-[#13131a] border border-purple-800/30 rounded-xl p-6">
            <div className="text-sm text-purple-400 mb-1">Avg Cost per Experiment</div>
            <div className="text-3xl font-bold text-white mb-2">
              {formatCurrency(avgCost)}
            </div>
            <div className="text-xs text-gray-400">
              {completedExperiments.length} completed experiments
            </div>
          </div>

          {/* Average Utilization */}
          <div className="bg-[#13131a] border border-purple-800/30 rounded-xl p-6">
            <div className="text-sm text-purple-400 mb-1">Avg GPU Utilization</div>
            <div className="text-3xl font-bold text-white mb-2">
              {formatPercent(avgUtilization)}
            </div>
            <div className={`text-xs ${avgUtilization >= 70 ? 'text-emerald-400' : avgUtilization >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {avgUtilization >= 70 ? 'Excellent efficiency' : avgUtilization >= 50 ? 'Good efficiency' : 'Needs improvement'}
            </div>
          </div>
        </div>

        {/* Running Experiments - Live Updates */}
        <div className="bg-[#13131a] border border-purple-800/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Live Experiments</h2>
          <div className="space-y-3">
            {RUNNING_EXPERIMENTS.map(exp => {
              const liveUpdate = liveUpdates.get(exp.id);
              const currentCost = liveUpdate?.currentCost || exp.totalCost;
              
              return (
                <div key={exp.id} className="bg-[#1a1a24] rounded-lg p-4 border border-purple-800/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{exp.name}</h3>
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                          {exp.gpuType} x{exp.numGPUs}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {exp.researcher} • {exp.team}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {formatCurrency(currentCost)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatCurrency(exp.costPerHour)}/hour
                      </div>
                    </div>
                  </div>

                  {liveUpdate && (
                    <div className="grid grid-cols-4 gap-4 text-xs">
                      <div>
                        <div className="text-gray-400">Progress</div>
                        <div className="text-white font-medium">
                          Epoch {liveUpdate.currentEpoch}/{liveUpdate.totalEpochs}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">ETA</div>
                        <div className="text-white font-medium">{liveUpdate.estimatedTimeRemaining}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">GPU Utilization</div>
                        <div className="text-white font-medium">{formatPercent(liveUpdate.gpuUtilization)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Throughput</div>
                        <div className="text-white font-medium">{liveUpdate.throughput}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Expensive Experiments */}
          <div className="bg-[#13131a] border border-purple-800/30 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Most Expensive Experiments</h2>
            <div className="space-y-2">
              {topExpensive.map((exp, idx) => (
                <div key={exp.id} className="flex items-center gap-3 p-3 bg-[#1a1a24] rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-300">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{exp.name}</div>
                    <div className="text-xs text-gray-400">{exp.gpuType} • {getRelativeTime(exp.startTime)}</div>
                  </div>
                  <div className="text-sm font-bold text-white">{formatCurrency(exp.totalCost)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Best ROI */}
          <div className="bg-[#13131a] border border-purple-800/30 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Best ROI Experiments</h2>
            <div className="space-y-2">
              {bestROI.map((exp, idx) => (
                <div key={exp.id} className="flex items-center gap-3 p-3 bg-[#1a1a24] rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{exp.name}</div>
                    <div className="text-xs text-gray-400">
                      +{formatPercent(exp.accuracyGain)} accuracy • {formatCurrency(exp.totalCost)}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-emerald-400">
                    ROI: {exp.roi.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Experiments Table */}
        <div className="bg-[#13131a] border border-purple-800/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Experiments</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-purple-800/20">
                  <th className="pb-3 font-medium">Experiment</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">GPU</th>
                  <th className="pb-3 font-medium">Duration</th>
                  <th className="pb-3 font-medium">Cost</th>
                  <th className="pb-3 font-medium">Accuracy</th>
                  <th className="pb-3 font-medium">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_EXPERIMENTS.slice(0, 10).map(exp => (
                  <tr key={exp.id} className="border-b border-purple-800/10 hover:bg-[#1a1a24]/50">
                    <td className="py-3">
                      <div className="text-white font-medium">{exp.name}</div>
                      <div className="text-xs text-gray-400">{exp.researcher}</div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        exp.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        exp.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        exp.status === 'running' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300">
                      {exp.gpuType} x{exp.numGPUs}
                    </td>
                    <td className="py-3 text-gray-300">
                      {exp.durationHours.toFixed(1)}h
                    </td>
                    <td className="py-3 text-white font-medium">
                      {formatCurrency(exp.totalCost)}
                    </td>
                    <td className="py-3">
                      <div className="text-gray-300">
                        {formatPercent(exp.finalAccuracy)}
                      </div>
                      <div className="text-xs text-emerald-400">
                        +{formatPercent(exp.accuracyGain)}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className={`text-sm ${
                        exp.avgGPUUtilization >= 70 ? 'text-emerald-400' :
                        exp.avgGPUUtilization >= 50 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {formatPercent(exp.avgGPUUtilization)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}