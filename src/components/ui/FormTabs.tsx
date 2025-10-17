"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TabItem {
  id: string;
  label: string;
  description?: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface FormTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
  onTabChange?: (tabId: string) => void;
}

export function FormTabs({
  tabs,
  defaultTab,
  className,
  onTabChange
}: FormTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "relative px-1 py-2 text-sm font-medium transition-colors",
                "border-b-2 border-transparent",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:border-muted"
              )}
            >
              <span className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </Button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {currentTab && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentTab.icon}
              {currentTab.label}
            </CardTitle>
            {currentTab.description && (
              <CardDescription>{currentTab.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {currentTab.content}
          </CardContent>
        </Card>
      )}
    </div>
  );
}