import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="container px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image src="/logo.png" alt="Hotel 734 Logo" width={40} height={40} className="h-10 w-auto" />
              <span className="text-xl font-bold">Hotel 734</span>
            </div>
            <p className="text-slate-400">
              Experience luxury and comfort at our premium hotel and resort. We offer the best accommodations and
              services for your perfect stay.
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                href="https://www.facebook.com/hotel734?mibextid=ZbWKwL"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/hotel.734?igsh=MWw2NXBxZ3R5a3V3YQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="text-slate-400 hover:text-white transition-colors">
                  Rooms
                </Link>
              </li>
              <li>
                <Link href="/facilities" className="text-slate-400 hover:text-white transition-colors">
                  Facilities
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-slate-400 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <address className="not-italic text-slate-400">
              <p>Hotel 734</p>
              <p>New Edubiase, Ghana</p>
              <p className="mt-2">Phone: +233 24 409 3821</p>
              <p>Email: info@hotel734@gmail.com</p>
            </address>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} Hotel 734. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
