import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white">
      <div className="container">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-10">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="Hotel 734 Logo" 
                width={35} 
                height={35} 
                className="h-9 w-auto" 
              />
              <div>
                <h2 className="text-lg font-semibold">Hotel 734</h2>
                <p className="text-[#A3A3A3] text-xs">Luxury & Comfort</p>
              </div>
            </div>
            <p className="text-[#A3A3A3] text-sm">
              Experience unparalleled luxury in the heart of New Edubiase.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/hotel734?mibextid=ZbWKwL"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A3A3A3] hover:text-white transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/hotel.734?igsh=MWw2NXBxZ3R5a3V3YQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A3A3A3] hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "Rooms & Suites", href: "/rooms" },
                { name: "Dining", href: "/dining" },
                { name: "Spa & Wellness", href: "/spa" },
                { name: "Events", href: "/events" },
                { name: "Gallery", href: "/gallery" },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-[#A3A3A3] hover:text-white transition-all duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-medium mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#A3A3A3] mt-0.5" />
                <div>
                  <p className="text-white text-sm">Hotel 734</p>
                  <p className="text-[#A3A3A3] text-sm">New Edubiase, Ghana</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#A3A3A3]" />
                <a href="tel:+233244093821" className="text-[#A3A3A3] hover:text-white transition-all duration-300 text-sm">
                  +233 24 409 3821
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#A3A3A3]" />
                <a href="mailto:info@hotel734@gmail.com" className="text-[#A3A3A3] hover:text-white transition-all duration-300 text-sm">
                  info@hotel734@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-base font-medium mb-4">Stay Updated</h3>
            <p className="text-[#A3A3A3] text-sm mb-3">
              Subscribe for special offers
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#333333] text-white placeholder:text-[#666666] focus:outline-none focus:border-[#666666] transition-all duration-300 text-sm"
              />
              <button
                type="submit"
                className="w-full px-3 py-2 bg-white text-black font-medium hover:bg-[#E5E5E5] transition-all duration-300 text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1A1A1A]">
          <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-3">
            <p className="text-[#A3A3A3] text-xs">
              © {new Date().getFullYear()} Hotel 734. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs">
              <Link href="/privacy" className="text-[#A3A3A3] hover:text-white transition-all duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[#A3A3A3] hover:text-white transition-all duration-300">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-[#A3A3A3] hover:text-white transition-all duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
