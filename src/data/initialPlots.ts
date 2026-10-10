import { PlotRecord } from '../types';

// Single demo record for demonstration purposes; all other plots start vacant
const SAMPLE_BURIALS: Record<number, { fullName: string; cnp: string; adeverinta: string; burialDate: string; notes?: string }> = {
  1: {
    fullName: "Hassan bin Abdullah Al-Fahim",
    cnp: "1920412123456",
    adeverinta: "48201",
    burialDate: "2021-04-12",
    notes: "Demonstration record on file.",
  },
};

export function generate200InitialPlots(): PlotRecord[] {
  const plots: PlotRecord[] = [];
  for (let i = 1; i <= 200; i++) {
    const sample = SAMPLE_BURIALS[i];
    if (sample) {
      plots.push({
        id: `plot-${i}`,
        plotNumber: i,
        status: 'occupied',
        fullName: sample.fullName,
        cnp: sample.cnp,
        passportId: sample.cnp, // backwards compatibility
        adeverinta: sample.adeverinta,
        burialDate: sample.burialDate,
        notes: sample.notes || 'Recorded in cemetery register.',
        updatedAt: `${sample.burialDate}T10:00:00.000Z`,
        updatedBy: 'Cemetery Administration',
      });
    } else {
      plots.push({
        id: `plot-${i}`,
        plotNumber: i,
        status: 'vacant',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    }
  }
  return plots;
}
