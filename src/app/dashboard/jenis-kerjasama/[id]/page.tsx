'use client';

import { useRouter, useParams } from "next/navigation";
import JenisKerjasamaForm from "../components/JenisKerjasamaForm";
import { BackButton } from "@/components/ui/BackButton";

export default function EditJenisKerjasamaPage() {
  const router = useRouter();
  const params = useParams();

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Jenis Kerjasama</h1>
          <p className="text-muted-foreground">
            Edit data jenis kerjasama yang ada
          </p>
        </div>

        <BackButton href="/dashboard/jenis-kerjasama" size="icon" iconOnly />
      </div>

      <JenisKerjasamaForm
        mode="edit"
        cooperationTypeId={parseInt(params.id as string)}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}