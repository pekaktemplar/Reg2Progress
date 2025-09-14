import React, { useEffect, useRef, useMemo } from 'react';
import { Chart } from 'chart.js/auto';
import { type Issue, type Branch, IssueStatus, IssuePriority } from '../types';

interface DashboardProps {
    issues: Issue[];
    branches: Branch[];
}

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">{title}</h2>
        <div>{children}</div>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ issues, branches }) => {
    const issuesByBranchChartRef = useRef<HTMLCanvasElement>(null);
    const issuesByPriorityChartRef = useRef<HTMLCanvasElement>(null);
    const issuesTrendChartRef = useRef<HTMLCanvasElement>(null);
    const chartInstances = useRef<{ [key: string]: Chart | null }>({}).current;

    const issuesByBranchData = useMemo(() => {
        const branchCounts = branches.map(branch => {
            const count = issues.filter(issue => issue.branchId === branch.id && issue.status !== IssueStatus.Resolved).length;
            return count;
        });
        return {
            labels: branches.map(b => b.name),
            data: branchCounts,
        };
    }, [issues, branches]);

    const issuesByPriorityData = useMemo(() => {
        const priorityCounts: Record<IssuePriority, number> = {
            [IssuePriority.High]: 0,
            [IssuePriority.Medium]: 0,
            [IssuePriority.Low]: 0,
        };
        issues.forEach(issue => {
            if (issue.status !== IssueStatus.Resolved) {
               priorityCounts[issue.priority]++;
            }
        });
        return {
            labels: ['Tinggi', 'Sedang', 'Rendah'],
            data: [priorityCounts.HIGH, priorityCounts.MEDIUM, priorityCounts.LOW],
        };
    }, [issues]);
    
    const issuesTrendData = useMemo(() => {
        const labels: string[] = [];
        const createdData: number[] = [];
        const resolvedData: number[] = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }));
            createdData.push(0);
            resolvedData.push(0);
        }

        issues.forEach(issue => {
            const createdAt = new Date(issue.createdAt);
            const createdMonth = new Date(createdAt.getFullYear(), createdAt.getMonth(), 1).getTime();

            const resolvedUpdate = issue.updates.find(u => u.text.toLowerCase().includes('status diubah menjadi selesai'));
            const resolvedAt = resolvedUpdate ? new Date(resolvedUpdate.timestamp) : null;
            const resolvedMonth = resolvedAt ? new Date(resolvedAt.getFullYear(), resolvedAt.getMonth(), 1).getTime() : null;

            for (let i = 0; i < 6; i++) {
                const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1).getTime();
                if (createdMonth === monthStart) {
                    createdData[i]++;
                }
                if (resolvedMonth === monthStart) {
                    resolvedData[i]++;
                }
            }
        });
        
        return { labels, createdData, resolvedData };
    }, [issues]);


    useEffect(() => {
        const createChart = (ref: React.RefObject<HTMLCanvasElement>, key: string, config: any) => {
            if (chartInstances[key]) {
                chartInstances[key]?.destroy();
            }
            if (ref.current) {
                const ctx = ref.current.getContext('2d');
                if (ctx) {
                    chartInstances[key] = new Chart(ctx, config);
                }
            }
        };

        // Chart 1: Isu Terbuka per Cabang
        createChart(issuesByBranchChartRef, 'issuesByBranch', {
            type: 'bar',
            data: {
                labels: issuesByBranchData.labels,
                datasets: [{
                    label: 'Jumlah Isu Terbuka',
                    data: issuesByBranchData.data,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                plugins: { legend: { display: false } }
            }
        });

        // Chart 2: Distribusi Isu per Prioritas
        createChart(issuesByPriorityChartRef, 'issuesByPriority', {
            type: 'pie',
            data: {
                labels: issuesByPriorityData.labels,
                datasets: [{
                    label: 'Distribusi Prioritas',
                    data: issuesByPriorityData.data,
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.5)',
                        'rgba(249, 115, 22, 0.5)',
                        'rgba(22, 163, 74, 0.5)',
                    ],
                    borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(249, 115, 22, 1)',
                        'rgba(22, 163, 74, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'top' } }
            }
        });

        // Chart 3: Tren Isu
        createChart(issuesTrendChartRef, 'issuesTrend', {
             type: 'line',
             data: {
                 labels: issuesTrendData.labels,
                 datasets: [
                     {
                         label: 'Isu Dibuat',
                         data: issuesTrendData.createdData,
                         borderColor: 'rgba(59, 130, 246, 1)',
                         backgroundColor: 'rgba(59, 130, 246, 0.2)',
                         fill: true,
                         tension: 0.3,
                     },
                     {
                         label: 'Isu Selesai',
                         data: issuesTrendData.resolvedData,
                         borderColor: 'rgba(22, 163, 74, 1)',
                         backgroundColor: 'rgba(22, 163, 74, 0.2)',
                         fill: true,
                         tension: 0.3,
                     }
                 ]
             },
             options: {
                 responsive: true,
                 scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                 plugins: { legend: { position: 'top' } }
             }
        });


        return () => {
            Object.values(chartInstances).forEach(chart => chart?.destroy());
        };
    }, [issuesByBranchData, issuesByPriorityData, issuesTrendData]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Dasbor Analitik</h1>
                <p className="text-slate-500">Visualisasi data isu di semua cabang klinik.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                    <ChartCard title="Isu Terbuka per Cabang">
                        <canvas ref={issuesByBranchChartRef}></canvas>
                    </ChartCard>
                </div>
                 <div>
                    <ChartCard title="Distribusi Isu Terbuka per Prioritas">
                        <canvas ref={issuesByPriorityChartRef}></canvas>
                    </ChartCard>
                </div>
                <div>
                     <ChartCard title="Tren Isu (6 Bulan Terakhir)">
                        <canvas ref={issuesTrendChartRef}></canvas>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};
