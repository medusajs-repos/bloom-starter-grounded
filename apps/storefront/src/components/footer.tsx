import CountrySelect from "@/components/country-select"
import { useRegions } from "@/lib/hooks/use-regions"
import { sdk } from "@/lib/utils/sdk"
import { useMutation } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useState } from "react"

// Social Icons
const YouTubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.498 4.80824 21.0708 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92925 4.59318 2.50198 4.84824 2.16135 5.19941C1.82072 5.55057 1.57879 5.98541 1.46 6.46C1.14521 8.20556 0.991235 9.97631 1 11.75C0.988687 13.537 1.14266 15.3213 1.46 17.08C1.59096 17.5398 1.83831 17.9581 2.17817 18.2945C2.51803 18.6308 2.93884 18.8738 3.4 19C5.12 19.46 12 19.46 12 19.46C12 19.46 18.88 19.46 20.6 19C21.0708 18.8668 21.498 18.6118 21.8387 18.2606C22.1793 17.9094 22.4212 17.4746 22.54 17C22.8524 15.2676 23.0063 13.5103 23 11.75C23.0113 9.96295 22.8573 8.1787 22.54 6.42Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.75 15.02L15.5 11.75L9.75 8.48V15.02Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const PinterestIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9 15C9 15 10 11 11.5 9C13 7 15 7.5 15 9.5C15 11.5 13 13 12 14L10 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="18" cy="6" r="1" fill="currentColor"/>
  </svg>
)

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 11V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 8V8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 16V13C12 11.8954 12.8954 11 14 11C15.1046 11 16 11.8954 16 13V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Payment icon URLs
const paymentIcons = {
  visa: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/visa-01KFNFX14CS2T8A7488RMV6STS.svg",
  mastercard: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/master-01KFNFX0J5JA2M8TP975B9G1SS.svg",
  applepay: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/apple-01KFNFX02VM5XJV2MQFKEJ4JDN.svg",
  paypal: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/paypal-01KFNFX0TKCR4QTBMRXA0KPZPB.svg",
}

const Footer = () => {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [alreadySubscribed, setAlreadySubscribed] = useState(false)

  const newsletterMutation = useMutation({
    mutationFn: async ({ email, name }: { email: string; name?: string }) => {
      const response = await sdk.client.fetch("/store/newsletter-signup", {
        method: "POST",
        body: { email, name: name || undefined },
      }) as { success: boolean; alreadySubscribed?: boolean }
      return response
    },
    onSuccess: (data) => {
      if (data.alreadySubscribed) {
        setAlreadySubscribed(true)
      } else {
        setSubscribed(true)
      }
      setEmail("")
      setName("")
    },
  })

  const { data: regions } = useRegions({
    fields: "id, currency_code, *countries",
  })

  const servicesLinks = [
    { name: "Shipping & Delivery", url: "#" },
    { name: "Terms & Conditions", url: "#" },
    { name: "Returns", url: "#" },
    { name: "Privacy Policy", url: "#" },
    { name: "Cookie Settings", url: "#" },
    { name: "FAQ", url: "#" },
  ]

  const companyLinks = [
    { name: "Contact", url: "#" },
    { name: "Careers", url: "#" },
    { name: "About Us", url: "#" },
    { name: "Stockists", url: "#" },
    { name: "Press", url: "#" },
  ]

  const socialLinks = [
    { name: "YouTube", url: "#", icon: <YouTubeIcon /> },
    { name: "Pinterest", url: "#", icon: <PinterestIcon /> },
    { name: "Facebook", url: "#", icon: <FacebookIcon /> },
    { name: "Instagram", url: "#", icon: <InstagramIcon /> },
    { name: "LinkedIn", url: "#", icon: <LinkedInIcon /> },
  ]

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      newsletterMutation.mutate({ email, name })
    }
  }

  return (
    <footer
      className="bg-[#1a1a1a] w-full text-white"
      data-testid="footer"
    >
      <div className="flex flex-col lg:flex-row">
        {/* Left Container - 50% width: Icon and Payment Methods */}
        <div className="w-full lg:w-1/2 px-4 py-6 lg:pl-8 lg:pr-12 lg:py-8 flex flex-col justify-between gap-6 lg:gap-16">
          {/* Logo */}
          <div className="flex-1 flex items-start">
            <img 
              src="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/grounded-icon-01KFNFGB26BYY04YBRFPXZ0QWV.svg" 
              alt="Grounded" 
              className="h-full w-auto object-contain opacity-90"
            />
          </div>

          {/* Payment Methods */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-0 md:mt-12 lg:mt-0 overflow-visible md:h-[1.25rem]">
            <span className="text-white/40 text-sm leading-none shrink-0">Payment methods</span>
            <div className="flex justify-between md:justify-start w-full md:w-auto gap-3 items-center">
              <img src={paymentIcons.applepay} alt="Apple Pay" className="brightness-0 invert" style={{ height: "3.3em" }} />
              <img src={paymentIcons.mastercard} alt="Mastercard" className="brightness-0 invert" style={{ height: "3.3em" }} />
              <img src={paymentIcons.paypal} alt="PayPal" className="brightness-0 invert" style={{ height: "3.3em" }} />
              <img src={paymentIcons.visa} alt="Visa" className="brightness-0 invert" style={{ height: "3.3em" }} />
            </div>
          </div>
        </div>

        {/* Right Container - 50% width: Newsletter, Links, Country Selector */}
        <div className="w-full lg:w-1/2 px-4 py-6 lg:pl-0 lg:pr-8 lg:py-8 flex flex-col gap-16">
          {/* Newsletter Section */}
          <div className="w-full md:w-auto">
            <p className="text-white/80 text-[16px] leading-none mb-6">
              Stay updated on new products, upcoming launches and exclusive drops.
            </p>
            {subscribed ? (
              <div className="flex items-center justify-between h-[80px] bg-white/5 p-4">
                <p className="text-white/80 text-[16px]">Thank you for subscribing!</p>
                <button
                  type="button"
                  onClick={() => setSubscribed(false)}
                  className="text-white/50 hover:text-white transition-colors p-1"
                  aria-label="Close message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ) : alreadySubscribed ? (
              <div className="flex items-center justify-between h-[80px] bg-white/5 p-4">
                <p className="text-orange-400 text-[16px]">This email is already subscribed to our newsletter.</p>
                <button
                  type="button"
                  onClick={() => setAlreadySubscribed(false)}
                  className="text-white/50 hover:text-white transition-colors p-1"
                  aria-label="Close message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col md:flex-row items-end gap-2 w-full">
              <label className="w-full md:flex-1 flex flex-col justify-between bg-white/5 p-2 h-[80px] hover:bg-white/10 transition-colors cursor-text">
                <span className="text-[16px] leading-none text-white/50">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent text-[16px] leading-none text-white placeholder:text-white/50 focus:outline-none"
                />
              </label>
              <label className="w-full md:flex-1 flex flex-col justify-between bg-white/5 p-2 h-[80px] hover:bg-white/10 transition-colors cursor-text">
                <span className="text-[16px] leading-none text-white/50">Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-[16px] leading-none text-white placeholder:text-white/50 focus:outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={newsletterMutation.isPending}
                className="relative w-full md:w-[120px] h-[80px] p-[8px] backdrop-blur-[4px] overflow-hidden transition-all duration-200 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white flex items-start justify-start text-[16px] leading-none"
              >
                {/* Grain texture overlay */}
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                  }}
                />
                <span className="relative z-10 block text-left text-[16px]">
                  {newsletterMutation.isPending ? "..." : "Sign up"}
                </span>
              </button>
            </form>
            )}
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <FooterColumn title="Services" links={servicesLinks} />
            <FooterColumn title="Grounded" links={companyLinks} />
            <div className="flex flex-col gap-y-4">
              <h3 className="text-white/50 text-sm font-medium uppercase tracking-widest">
                Follow us
              </h3>
              <ul className="space-y-3">
                {socialLinks.map((link) => (
                  <li key={link.name} className="text-sm">
                    <a
                      href={link.url}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Country Selector */}
          <div className="flex items-center gap-4 text-white text-sm mt-auto">
            <span className="text-white/40">Country</span>
            <CountrySelect regions={regions ?? []} variant="dark" />
          </div>
        </div>
      </div>
    </footer>
  )
}

const FooterColumn = ({
  title,
  links,
}: {
  title: string
  links: {
    name: string
    url: string
  }[]
}) => {
  return (
    <div className="flex flex-col gap-y-4">
      <h3 className="text-white/50 text-sm font-medium uppercase tracking-widest">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.url + link.name} className="text-sm">
            <Link
              to={link.url}
              className="text-white/80 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Footer
