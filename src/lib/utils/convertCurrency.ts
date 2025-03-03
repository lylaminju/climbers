const exchangeRates = {
	CAD: 0.7, // 1 CAD = 0.7 USD
	USD: 1,
};

export function toUSD(amount: number, currency: string): number {
	return amount * (exchangeRates[currency as keyof typeof exchangeRates] || 1);
}
