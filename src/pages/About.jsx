import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, Shield, HeartHandshake, Sparkles, RefreshCw, Truck } from "lucide-react"

export default function About() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] font-sans">
      {/* Hero Section */}
      <section className="py-20 sm:py-24 border-b border-[#E5DFD5] bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059] block mb-3">
            About Ecomstore
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1816] mb-6 leading-tight max-w-4xl mx-auto">
            Quality clothing made for everyday life.
          </h1>
          <p className="text-base sm:text-lg text-[#6A645D] leading-relaxed max-w-3xl mx-auto font-normal mb-8">
            We started Ecomstore with a simple idea: classic, well-made clothing doesn’t need a giant logo or an outrageous designer markup. Just good materials, clean design, and honest pricing.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/shop"
              className="bg-[#1A1816] text-[#FAF8F5] px-8 py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#1A1816] transition-colors inline-flex items-center gap-2 no-underline"
            >
              <span>Explore The Shop</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Story & Philosophy Section */}
      <section className="py-20 border-b border-[#E5DFD5] bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Visual Mosaic */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-5">
              <div className="space-y-4">
                <div className="aspect-[4/5] bg-[#F2EFE9] rounded-lg overflow-hidden border border-[#E5DFD5]">
                  <img
                    src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80"
                    alt="Fabric tailoring and crafting"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-lg">
                  <p className="font-serif text-2xl font-bold text-[#1A1816]">100%</p>
                  <p className="text-xs text-[#6A645D] mt-0.5 font-medium">Natural fibers: wool, cotton, and leather.</p>
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <div className="p-5 bg-[#1A1816] text-[#FAF8F5] rounded-lg">
                  <p className="font-serif text-2xl font-bold text-[#C5A059]">Zero</p>
                  <p className="text-xs text-[#FAF8F5]/80 mt-0.5 font-medium">Middleman markups. Direct to you.</p>
                </div>
                <div className="aspect-[4/5] bg-[#F2EFE9] rounded-lg overflow-hidden border border-[#E5DFD5]">
                  <img
                    src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80"
                    alt="Gentleman wearing tailored blazer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059] block">
                How We Started
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1816] tracking-tight leading-snug">
                Tired of clothes that fall apart after one season.
              </h2>
              <p className="text-sm sm:text-base text-[#6A645D] leading-relaxed">
                For years, finding good clothes felt like choosing between two bad options: cheap fast-fashion made from plastic polyester that shrinks after two washes, or luxury labels charging $1,500 just to slap a logo on a plain sweater.
              </p>
              <p className="text-sm sm:text-base text-[#6A645D] leading-relaxed">
                We built Ecomstore to offer a better third option. We work directly with independent workshops to craft timeless wardrobe essentials using pure virgin cashmere, long-staple cotton, and full-grain leather.
              </p>
              <p className="text-sm sm:text-base text-[#6A645D] leading-relaxed">
                No bloated wholesale markups, no flash sales, and no chasing weekly micro-trends. Just clothes that look great, fit comfortably, and hold up season after season.
              </p>

              <div className="pt-2 flex flex-wrap gap-6 text-xs text-[#1A1816] font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#C5A059]" />
                  <span>Ethically produced</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#C5A059]" />
                  <span>No synthetic blends</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#C5A059]" />
                  <span>Fair factory wages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values / What Sets Us Apart */}
      <section className="py-20 bg-[#FAF8F5] border-b border-[#E5DFD5]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059] block mb-2">
              Our Principles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1816]">
              What we stand for
            </h2>
            <p className="text-xs sm:text-sm text-[#6A645D] mt-2">
              Simple commitments we stick to on every single product we release.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white border border-[#E5DFD5] rounded-xl flex flex-col justify-between hover:border-[#1A1816] transition-colors">
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-center text-[#1A1816] mb-5">
                  <Shield size={22} className="text-[#C5A059]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1A1816] mb-2">
                  Real, Honest Materials
                </h3>
                <p className="text-xs sm:text-sm text-[#6A645D] leading-relaxed">
                  We refuse to cut corners with synthetic polyesters or flimsy blends. Every sweater is pure wool or cashmere, every shirt is 100% long-staple cotton, and every shoe is authentic full-grain leather.
                </p>
              </div>
            </div>

            <div className="p-8 bg-white border border-[#E5DFD5] rounded-xl flex flex-col justify-between hover:border-[#1A1816] transition-colors">
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-center text-[#1A1816] mb-5">
                  <HeartHandshake size={22} className="text-[#C5A059]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1A1816] mb-2">
                  Transparent Pricing
                </h3>
                <p className="text-xs sm:text-sm text-[#6A645D] leading-relaxed">
                  Traditional department stores mark up their items 5 to 8 times above manufacturing cost. By selling directly to you online, we offer the same artisan caliber at a fraction of the price.
                </p>
              </div>
            </div>

            <div className="p-8 bg-white border border-[#E5DFD5] rounded-xl flex flex-col justify-between hover:border-[#1A1816] transition-colors">
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-center text-[#1A1816] mb-5">
                  <Sparkles size={22} className="text-[#C5A059]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1A1816] mb-2">
                  Timeless, Clean Design
                </h3>
                <p className="text-xs sm:text-sm text-[#6A645D] leading-relaxed">
                  We don’t chase whatever trend is hot this month on social media. We design versatile, understated pieces that look just as sharp ten years from now as they do today.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Behind the Craft: 3 Real Steps */}
      <section className="py-20 bg-white border-b border-[#E5DFD5]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059] block mb-2">
              Our Process
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1816]">
              From workshop to your door
            </h2>
            <p className="text-xs sm:text-sm text-[#6A645D] mt-2">
              How we take an idea and turn it into a wardrobe staple you’ll reach for every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="aspect-[16/10] bg-[#FAF8F5] border border-[#E5DFD5] rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80"
                  alt="Raw fabric selection"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider block">Step 01</span>
              <h3 className="font-serif text-lg font-bold text-[#1A1816]">Direct Sourcing</h3>
              <p className="text-xs text-[#6A645D] leading-relaxed">
                We visit mills and tanneries in person to select fabrics with the right weight, drape, and durability before any cutting begins.
              </p>
            </div>

            <div className="space-y-4">
              <div className="aspect-[16/10] bg-[#FAF8F5] border border-[#E5DFD5] rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80"
                  alt="Crafting and stitching"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider block">Step 02</span>
              <h3 className="font-serif text-lg font-bold text-[#1A1816]">Precision Stitching</h3>
              <p className="text-xs text-[#6A645D] leading-relaxed">
                Independent family-run workshops cut and tailor each piece. From reinforced seams to welted soles, every detail is built to endure wear.
              </p>
            </div>

            <div className="space-y-4">
              <div className="aspect-[16/10] bg-[#FAF8F5] border border-[#E5DFD5] rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80"
                  alt="Finished product inspection"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider block">Step 03</span>
              <h3 className="font-serif text-lg font-bold text-[#1A1816]">Quality Check & Ship</h3>
              <p className="text-xs text-[#6A645D] leading-relaxed">
                Every single item is hand-inspected for stitching, fit, and finish before being carefully packaged and shipped to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Guarantees */}
      <section className="py-14 bg-[#FAF8F5] border-b border-[#E5DFD5]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
              <Truck size={24} className="text-[#C5A059] shrink-0" />
              <div>
                <h4 className="font-serif text-sm font-bold text-[#1A1816]">Free Shipping Over $150</h4>
                <p className="text-xs text-[#6A645D] mt-0.5">Reliable express delivery with real-time tracking.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
              <RefreshCw size={24} className="text-[#C5A059] shrink-0" />
              <div>
                <h4 className="font-serif text-sm font-bold text-[#1A1816]">30-Day Easy Returns</h4>
                <p className="text-xs text-[#6A645D] mt-0.5">Try it at home. If the fit isn't right, return it hassle-free.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
              <HeartHandshake size={24} className="text-[#C5A059] shrink-0" />
              <div>
                <h4 className="font-serif text-sm font-bold text-[#1A1816]">Direct Human Support</h4>
                <p className="text-xs text-[#6A645D] mt-0.5">Reach out anytime — our team is here to help with sizing and orders.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#1A1816] text-[#FAF8F5]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
            Ready to find your next staple?
          </h2>
          <p className="text-sm text-[#FAF8F5]/80 max-w-lg mx-auto mb-8 font-normal leading-relaxed">
            Check out our collection of jackets, knitwear, shirts, and footwear — all made with the same commitment to real quality.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="bg-[#C5A059] text-[#1A1816] px-8 py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors no-underline inline-flex items-center gap-2"
            >
              <span>Shop All Products</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/sale"
              className="border border-[#FAF8F5]/30 text-[#FAF8F5] px-8 py-3.5 text-xs font-bold uppercase tracking-wider hover:border-white hover:bg-white/10 transition-colors no-underline"
            >
              <span>View Sale</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
