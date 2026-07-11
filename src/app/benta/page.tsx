import { BentaDemo } from "@/components/benta/benta-demo";
import { PageHeader } from "@/components/app/page-header";

export default function BentaPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Checkout"
        title="Benta"
        description="Cash checkout using local Paninda products. Search items, build a cart, enter cash received, and complete a real local sale."
      />
      <BentaDemo />
    </div>
  );
}
