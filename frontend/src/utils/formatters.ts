// Professional Currency & Number Formatters

export function formatLPA(amount?: number | null): string {
  if (!amount || amount <= 0) return "N/A";
  const lpa = amount / 100000;
  return `₹${lpa.toFixed(1)} LPA`;
}

export function formatCurrency(amount?: number | null, unit: string = ""): string {
  if (!amount || amount <= 0) return "Nominal Govt Fee";
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatSeats(seats?: number | null): string {
  if (!seats) return "N/A";
  return `${seats} Intake Seats`;
}
