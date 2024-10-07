import Papa from 'papaparse';

export async function prepareChartData(fileName: string): Promise<{ time: string; value: number }[]> {
  const response = await fetch(`/dashboard_data/${fileName}`);
  const csvData = await response.text();
  
  const { data } = Papa.parse(csvData, { header: true });
  
  return data.map((row: any) => ({
    time: row.Date,
    value: parseFloat(row.altcoin_dollar_oi)
  }));
}