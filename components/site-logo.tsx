interface SiteLogoProps {
  className?: string
}

export function SiteLogo({ className = "size-45" }: SiteLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="DIAN Íntegros"
      className={`${className} h-auto w-auto max-h-45 max-w-45 object-contain`}
    />
  )
}
