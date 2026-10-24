import { Link } from "react-router-dom"
import { ShieldCheck, Award, Sparkles, Scissors, Clock, ArrowRight } from "lucide-react"

export default function About() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] font-sans">
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 bg-[#F2EFE9] border-b border-[#E5DFD5] overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#1A1816_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A059] block mb-4">
            The Maison & Heritage
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1A1816] mb-6 leading-tight">
            Quiet Luxury.<br />Heirloom Craftsmanship.
          </h1>
          <p className="text-sm sm:text-base text-[#6A645D] max-w-2xl mx-auto leading-relaxed font-normal mb-8">
            Founded on the conviction that authentic elegance never shouts. We curate bespoke tailoring, Goodyear-welted cobblery, and Tuscan vegetable-tanned leather goods for those who value enduring substance over transient trends.
          </p>
          <div className="inline-flex items-center gap-3 border-t border-b border-[#C5A059]/40 py-2.5 px-6">
            <span className="font-serif italic text-xs tracking-widest text-[#1A1816]">
              Est. Savile Row & Florence ❖ Handcrafted in Europe
            </span>
          </div>
        </div>
      </section>

      {/* Narrative Section - The Philosophy */}
      <section className="py-20 border-b border-[#E5DFD5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Imagery Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] bg-[#E5DFD5] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80"
                    alt="Artisan Cutting Fabric"
                    className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="p-4 bg-[#F2EFE9] border border-[#E5DFD5] text-center">
                  <span className="font-serif text-2xl font-bold text-[#1A1816] block">100%</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#8E877E] font-semibold">Noble Natural Fibers</span>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="p-4 bg-[#1A1816] text-[#FAF8F5] text-center">
                  <span className="font-serif text-2xl font-bold text-[#C5A059] block">180+</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#8E877E] font-semibold">Operations per Shoe</span>
                </div>
                <div className="aspect-[3/4] bg-[#E5DFD5] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80"
                    alt="Leather Cobbler Finish"
                    className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Right Philosophy Narrative */}
            <div className="space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C5A059] block">
                The Sartorial Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1816] leading-snug">
                An antidote to disposable fashion. Designed to be inherited, not discarded.
              </h2>
              <p className="text-xs sm:text-sm text-[#6A645D] leading-relaxed font-normal">
                True old money dressing is fundamentally understated. It eschews conspicuous emblems, synthetic blends, and the restless cadence of runway seasons. In their stead, we champion natural heavyweight tweeds, Mongolian combed cashmere, full-grain bridle leathers, and hand-rolled silks.
              </p>
              <p className="text-xs sm:text-sm text-[#6A645D] leading-relaxed font-normal">
                Every silhouette in our collection has been refined over decades. A double-breasted overcoat cut to flatter naturally without constriction; trousers with forward pleats that fall into an unbroken break; shoes welted to withstand thirty years of cobblestones.
              </p>

              <div className="pt-4 grid grid-cols-2 gap-6 border-t border-[#E5DFD5]">
                <div>
                  <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1A1816] mb-1">
                    Zero Synthetic Blends
                  </h4>
                  <p className="text-xs text-[#8E877E]">
                    Only virgin wool, combed cashmere, Sea Island cotton, and pure mulberry silk.
                  </p>
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1A1816] mb-1">
                    Goodyear-Welted Soles
                  </h4>
                  <p className="text-xs text-[#8E877E]">
                    Resolable over decades by any master cobbler around the globe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four Pillars of Craftsmanship */}
      <section className="py-20 bg-[#F2EFE9] border-b border-[#E5DFD5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C5A059] block mb-2">
              The Four Pillars
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1816]">
              Mastery of Raw Materials
            </h2>
            <p className="text-xs sm:text-sm text-[#6A645D] mt-3">
              We source solely from ancestral mills and tanneries whose archives date back over two centuries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="bg-[#FAF8F5] p-8 border border-[#E5DFD5] flex flex-col justify-between hover:border-[#1A1816] transition-colors">
              <div>
                <div className="w-10 h-10 bg-[#1A1816] text-[#C5A059] flex items-center justify-center mb-6">
                  <Scissors size={20} />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1A1816] mb-2 uppercase tracking-wide">
                  Scottish Cashmere
                </h3>
                <p className="text-xs text-[#6A645D] leading-relaxed">
                  Spun from the delicate underfleece of capra hircus goats, washed in mineral-rich Scottish loch waters for unmatched softness that deepens with age.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mt-6 block">
                Hawick & Elgin Mills
              </span>
            </div>

            {/* Pillar 2 */}
            <div className="bg-[#FAF8F5] p-8 border border-[#E5DFD5] flex flex-col justify-between hover:border-[#1A1816] transition-colors">
              <div>
                <div className="w-10 h-10 bg-[#1A1816] text-[#C5A059] flex items-center justify-center mb-6">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1A1816] mb-2 uppercase tracking-wide">
                  Tuscan Tanneries
                </h3>
                <p className="text-xs text-[#6A645D] leading-relaxed">
                  Full-grain French calf and bovine hides pit-tanned with natural chestnut and mimosa barks over 60 days, yielding a lustrous, enduring patina.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mt-6 block">
                Santa Croce sull'Arno
              </span>
            </div>

            {/* Pillar 3 */}
            <div className="bg-[#FAF8F5] p-8 border border-[#E5DFD5] flex flex-col justify-between hover:border-[#1A1816] transition-colors">
              <div>
                <div className="w-10 h-10 bg-[#1A1816] text-[#C5A059] flex items-center justify-center mb-6">
                  <Award size={20} />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1A1816] mb-2 uppercase tracking-wide">
                  Goodyear Welting
                </h3>
                <p className="text-xs text-[#6A645D] leading-relaxed">
                  Ribbed gemming and oak bark-tanned leather soles sewn together with lock-stitch linen thread, guaranteeing waterproof durability and perpetual recrafting.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mt-6 block">
                Northamptonshire Tradition
              </span>
            </div>

            {/* Pillar 4 */}
            <div className="bg-[#FAF8F5] p-8 border border-[#E5DFD5] flex flex-col justify-between hover:border-[#1A1816] transition-colors">
              <div>
                <div className="w-10 h-10 bg-[#1A1816] text-[#C5A059] flex items-center justify-center mb-6">
                  <Clock size={20} />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1A1816] mb-2 uppercase tracking-wide">
                  Sea Island Cotton
                </h3>
                <p className="text-xs text-[#6A645D] leading-relaxed">
                  Extra-long staple Gossypium barbadense fibers grown in the West Indies, offering the tensile strength of linen with the supreme softness of silk.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mt-6 block">
                Single-Needle Bespoke
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Atelier Standards & Heritage Pledge */}
      <section className="py-20 border-b border-[#E5DFD5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-3 bg-[#F2EFE9] border border-[#E5DFD5] mb-6">
            <Sparkles size={24} className="text-[#C5A059]" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1816] mb-6">
            The Wardrobe Covenant
          </h2>
          <blockquote className="font-serif italic text-lg sm:text-xl text-[#3D3833] leading-relaxed mb-8 max-w-3xl mx-auto">
            "A gentleman’s attire should never call attention to its novelty. It should appear as though it has always belonged to him — pressed into service with quiet confidence and preserved with attentive reverence."
          </blockquote>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#8E877E]">
            — Archival Atelier Manifesto, London
          </p>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-24 bg-[#1A1816] text-[#FAF8F5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A059] block mb-3">
            Inquire & Acquire
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF8F5] mb-6">
            Invest in Timeless Wardrobe Pieces
          </h2>
          <p className="text-xs sm:text-sm text-[#8E877E] max-w-xl mx-auto mb-10 leading-relaxed">
            Browse our full seasonal collection or explore the private seasonal sale archive with privileged member pricing.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/shop"
              className="bg-[#C5A059] text-[#1A1816] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.16em] hover:bg-[#d8b368] transition-colors inline-flex items-center justify-center gap-2 no-underline"
            >
              <span>Explore The Collection</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/sale"
              className="border border-[#FAF8F5]/30 text-[#FAF8F5] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.16em] hover:border-white hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2 no-underline"
            >
              <span>Seasonal Archive Sale</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
