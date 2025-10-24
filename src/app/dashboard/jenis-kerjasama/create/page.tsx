'use client';

import { useRouter } from "next/navigation";
import JenisKerjasamaForm from "../components/JenisKerjasamaForm";
import { BackButton } from "@/components/ui/BackButton";

export default function CreateJenisKerjasamaPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/jenis-kerjasama');
  };

  const handleCancel = () => {
    router.push('/dashboard/jenis-kerjasama');
  };

  return (
    <div className="@container/main space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Jenis Kerjasama</h1>
          <p className="text-muted-foreground">
            Buat jenis kerjasama baru dengan form yang terstruktur
          </p>
        </div>

        <BackButton href="/dashboard/jenis-kerjasama" size="icon" iconOnly />
      </div>

      <JenisKerjasamaForm
        mode="create"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}