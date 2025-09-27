'use client';

import { useState, useEffect } from "react";
import { PartnerManager, Partner } from "@/components/ui/PartnerManager";

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners');
      if (!response.ok) {
        throw new Error('Failed to fetch partners');
      }
      const data = await response.json();
      setPartners(data.partners);
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  return (
    <div className="@container/main space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Partners Management</h1>
        <p className="text-muted-foreground">
          Manage partnership relationships and organizations displayed on your website
        </p>
      </div>

      {/* Partner Manager Component */}
      <PartnerManager partners={partners} onPartnersChange={setPartners} />
    </div>
  )
}