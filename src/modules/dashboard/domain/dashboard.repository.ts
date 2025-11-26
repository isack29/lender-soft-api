export interface IDashboardRepository {
  getTotalLent(lenderId: string): Promise<number>;
  getTotalCollected(lenderId: string): Promise<number>;
  getActiveLoansCount(lenderId: string): Promise<number>;
  getTotalLoansCount(lenderId: string): Promise<number>;
  getTotalDebtorsCount(lenderId: string): Promise<number>;
}
