import { BentaDemo } from "@/components/benta/benta-demo";
import { PageHeader } from "@/components/app/page-header";

export default function BentaPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Checkout"
        title="Benta"
        description="Demo cash checkout using local IndexedDB data. Try adding products, entering cash received, and completing a sale."
      />
      <BentaDemo />
    </div>
  );
}
