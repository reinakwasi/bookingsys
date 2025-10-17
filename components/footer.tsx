import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react"
import { useState } from "react"

export default function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<"idle" | "success" | "error" | "already_subscribed">("idle")
  const [subscriptionMessage, setSubscriptionMessage] = useState("")

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubscribing(true)
    
    try {
      // Send subscription request to API
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const result = await response.json()
      
      if (response.ok) {
        setSubscriptionStatus("success")
        setSubscriptionMessage("Successfully subscribed!")
        setEmail("")
        setTimeout(() => {
          setSubscriptionStatus("idle")
          setSubscriptionMessage("")
        }, 5000)
      } else {
        // Check if it's a duplicate subscription (not really an error)
        if (result.error && result.error.includes('already subscribed')) {
          setSubscriptionStatus("already_subscribed")
          setSubscriptionMessage("You're already subscribed!")
          setEmail("")
          console.log('User already subscribed:', result.error)
          setTimeout(() => {
            setSubscriptionStatus("idle")
            setSubscriptionMessage("")
          }, 5000)
        } else {
          setSubscriptionStatus("error")
          setSubscriptionMessage(result.error || "Subscription failed. Please try again.")
          console.error('Subscription error:', result.error)
          setTimeout(() => {
            setSubscriptionStatus("idle")
            setSubscriptionMessage("")
          }, 5000)
        }
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setSubscriptionStatus("error")
      setTimeout(() => setSubscriptionStatus("idle"), 3000)
    } finally {
      setIsSubscribing(false)
    }
  }
  return (
    <footer className="bg-[#0A0A0A] text-white">
      <div className="container-responsive">
        {/* Main Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 py-8 sm:py-10">
          {/* Brand Section */}
          <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image 
                src="/logo.png" 
                alt="Hotel 734 Logo" 
                width={35} 
                height={35} 
                className="h-7 sm:h-9 w-auto" 
              />
              <div>
                <h2 className="text-base sm:text-lg font-semibold">Hotel 734</h2>
                <p className="text-[#A3A3A3] text-xs">Luxury & Comfort</p>
              </div>
            </div>
            <p className="text-[#A3A3A3] text-sm leading-relaxed">
              Experience exceptional hospitality in the heart of New Edubiase.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/hotel734?mibextid=ZbWKwL"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A3A3A3] hover:text-white transition-all duration-300 p-1"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href="https://www.instagram.com/hotel.734?igsh=MWw2NXBxZ3R5a3V3YQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A3A3A3] hover:text-white transition-all duration-300 p-1"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@hotel.734"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A3A3A3] hover:text-white transition-all duration-300 p-1"
                aria-label="TikTok"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm sm:text-base font-medium mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "Rooms & Suites", href: "/rooms" },
                { name: "Events", href: "/events" },
                { name: "Tickets", href: "/tickets" },
                { name: "Gallery", href: "/gallery" },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-[#A3A3A3] hover:text-white transition-all duration-300 text-xs sm:text-sm block py-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm sm:text-base font-medium mb-3 sm:mb-4">Contact Us</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-[#A3A3A3] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white text-xs sm:text-sm">Hotel 734</p>
                  <p className="text-[#A3A3A3] text-xs sm:text-sm">New Edubiase, Ghana</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-[#A3A3A3] flex-shrink-0" />
                <a href="tel:+233244093821" className="text-[#A3A3A3] hover:text-white transition-all duration-300 text-xs sm:text-sm">
                  +233 24 409 3821
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-[#A3A3A3] flex-shrink-0" />
                <a href="mailto:info@hotel734@gmail.com" className="text-[#A3A3A3] hover:text-white transition-all duration-300 text-xs sm:text-sm break-all">
                  info@hotel734@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm sm:text-base font-medium mb-3 sm:mb-4">Stay Updated</h3>
            <p className="text-[#A3A3A3] text-xs sm:text-sm mb-3">
              Subscribe for special offers
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#333333] text-white placeholder:text-[#666666] focus:outline-none focus:border-[#666666] transition-all duration-300 text-xs sm:text-sm rounded disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSubscribing || !email.trim()}
                className="w-full px-3 py-2 bg-white text-black font-medium hover:bg-[#E5E5E5] transition-all duration-300 text-xs sm:text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? "Subscribing..." : 
                 subscriptionStatus === "success" ? "Subscribed!" : 
                 subscriptionStatus === "already_subscribed" ? "Already Subscribed!" :
                 subscriptionStatus === "error" ? "Try Again" : "Subscribe"}
              </button>
            </form>
            {(subscriptionStatus === "success" || subscriptionStatus === "already_subscribed") && (
              <p className="text-green-400 text-xs mt-2">{subscriptionMessage}</p>
            )}
            {subscriptionStatus === "error" && (
              <p className="text-red-400 text-xs mt-2">{subscriptionMessage}</p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1A1A1A]">
          <div className="flex justify-center items-center py-4">
            <p className="text-[#A3A3A3] text-sm text-center">
              © 2025 Hotel 734. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
