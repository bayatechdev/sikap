"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  href?: string;
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick?: () => void;
  iconOnly?: boolean;
}

export function BackButton({
  href,
  label = "Kembali",
  variant = "outline",
  size = "default",
  className = "",
  onClick,
  iconOnly = false
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  const buttonContent = (
    <>
      <ArrowLeft className="h-4 w-4" />
      {!iconOnly && size !== "icon" && <span className="ml-2">{label}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href}>
        <Button
          variant={variant}
          size={size}
          className={className}
          type="button"
        >
          {buttonContent}
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      type="button"
      onClick={handleClick}
    >
      {buttonContent}
    </Button>
  );
}