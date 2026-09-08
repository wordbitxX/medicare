import React from "react";
import {
  Stethoscope,
  HeartPulse,
  Sparkles,
  ShieldAlert,
  Smile,
  UserCheck,
  Activity,
  HeartHandshake,
  Baby,
  Eye,
  Footprints,
  Dumbbell,
  Scissors,
  TestTube,
  Bone,
  Ear,
  Brain,
  Droplet,
  Syringe,
  Flower2,
  type LucideIcon,
} from "lucide-react";

export const SERVICE_ICON_MAP: Record<string, LucideIcon> = {
  Stethoscope,
  HeartPulse,
  Sparkles,
  ShieldAlert,
  Smile,
  UserCheck,
  Activity,
  HeartHandshake,
  Baby,
  Eye,
  Footprints,
  Dumbbell,
  Scissors,
  TestTube,
  Bone,
  Ear,
  Brain,
  Droplet,
  Syringe,
  Flower2,
};

export function getServiceIcon(iconName?: string | null): LucideIcon {
  if (iconName && SERVICE_ICON_MAP[iconName]) {
    return SERVICE_ICON_MAP[iconName];
  }
  return Stethoscope;
}

interface ServiceIconProps {
  iconName?: string | null;
  className?: string;
}

export function ServiceIcon({ iconName, className = "h-6 w-6" }: ServiceIconProps) {
  const Icon = getServiceIcon(iconName);
  return <Icon className={className} strokeWidth={2} />;
}
