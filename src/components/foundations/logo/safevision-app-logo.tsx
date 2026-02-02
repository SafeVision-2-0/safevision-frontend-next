"use client";

export default function SafevisionAppLogo({ className }: { className?: string}) {
  return (
    <img src="/applogo.svg" alt="Logo" className={`${className || ''}`} />
  )
}