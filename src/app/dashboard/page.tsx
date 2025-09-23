'use client';


// Import our existing dashboard content
import DashboardContent from "./dashboard-content"

export default function Page() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 pt-0">
        <DashboardContent />
      </div>
    </>
  )
}