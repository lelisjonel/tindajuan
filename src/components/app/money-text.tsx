type MoneyTextProps = {
  amount: number;
  className?: string;
};

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export function MoneyText({ amount, className = "" }: MoneyTextProps) {
  return <span className={className}>{pesoFormatter.format(amount)}</span>;
}
