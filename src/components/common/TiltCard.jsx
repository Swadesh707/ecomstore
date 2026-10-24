import { useState, useRef } from "react"

export default function TiltCard({ children, className = "", maxRotate = 7, glare = true }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 })
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const box = cardRef.current.getBoundingClientRect()
    const x = e.clientX - box.left
    const y = e.clientY - box.top
    const centerX = box.width / 2
    const centerY = box.height / 2
    const rotateX = ((y - centerY) / centerY) * -maxRotate
    const rotateY = ((x - centerX) / centerX) * maxRotate
    
    setRotate({ x: rotateX, y: rotateY })
    setGlarePos({
      x: (x / box.width) * 100,
      y: (y / box.height) * 100,
      opacity: 0.12,
    })
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
    setGlarePos((prev) => ({ ...prev, opacity: 0 }))
  }

  return (
    <div
      ref={cardRef}
      className={`relative [perspective:1000px] ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="w-full h-full transition-transform duration-200 ease-out [transform-style:preserve-3d] relative"
        style={{ transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)` }}
      >
        {children}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45) 0%, transparent 65%)`,
            }}
          />
        )}
      </div>
    </div>
  )
}
