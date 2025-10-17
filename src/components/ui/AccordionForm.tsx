"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, ChevronDown, ChevronRight } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  isDefaultOpen?: boolean;
}

interface AccordionFormProps {
  items: AccordionItem[];
  title: string;
  description?: string;
  onAddItem?: () => void;
  addButtonText?: string;
  canAdd?: boolean;
  className?: string;
}

export function AccordionForm({
  items,
  title,
  description,
  onAddItem,
  addButtonText = "Tambah Item",
  canAdd = true,
  className
}: AccordionFormProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(items.filter(item => item.isDefaultOpen).map(item => item.id))
  );

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          {canAdd && onAddItem && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddItem}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {addButtonText}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Belum ada item yang ditambahkan</p>
            {canAdd && onAddItem && (
              <Button
                type="button"
                variant="outline"
                onClick={onAddItem}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                {addButtonText}
              </Button>
            )}
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className="border rounded-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full px-4 py-3 flex items-center justify-between bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    {openItems.has(item.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </button>

              {openItems.has(item.id) && (
                <div className="px-4 pb-4 border-t bg-background">
                  {item.content}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}