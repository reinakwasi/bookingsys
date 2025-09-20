"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, memo } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Rooms", href: "/rooms" },
  { name: "Facilities", href: "/facilities" },
  { name: "Events", href: "/events" },
  { name: "Tickets", href: "/tickets" },
  { name: "Contact", href: "/contact" },
]

const Navbar = memo(function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-black/80 to-transparent">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-110">
            <Image 
              src="/logo.png" 
              alt="Hotel 734 Logo" 
              fill 
              className="object-contain" 
              priority
            />
          </div>
          <span className="text-xl font-bold text-white tracking-wide">Hotel 734</span>
        </Link>

        <nav className="hidden md:flex md:items-center md:space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative text-sm font-medium text-white/80 hover:text-white transition-all duration-300",
                pathname === item.href && "text-white"
              )}
            >
              {item.name}
              {pathname === item.href && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform duration-300" />
              )}
            </Link>
          ))}
        </nav>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button 
              variant="outline" 
              size="icon" 
              className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className="bg-black/95 backdrop-blur-md border-white/10"
          >
            <nav className="flex flex-col gap-6 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-base font-medium text-white/80 hover:text-white transition-all duration-300 relative",
                    pathname === item.href && "text-white"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                  {pathname === item.href && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-amber-400" />
                  )}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
})

export default Navbar
