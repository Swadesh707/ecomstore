export function validateLuhn(cardNumber) {
  const sanitized = String(cardNumber || "").replace(/\D/g, "")
  if (sanitized.length < 13 || sanitized.length > 19) {
    return false
  }

  let sum = 0
  let alternate = false

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10)
    if (alternate) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    sum += digit
    alternate = !alternate
  }

  return sum % 10 === 0
}

export function detectCardBrand(cardNumber) {
  const sanitized = String(cardNumber || "").replace(/\D/g, "")
  if (/^4/.test(sanitized)) return "Visa"
  if (/^(5[1-5]|2[2-7])/.test(sanitized)) return "Mastercard"
  if (/^3[47]/.test(sanitized)) return "American Express"
  if (/^(6011|65|64[4-9])/.test(sanitized)) return "Discover"
  return "Card"
}

export function formatCardNumber(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 19)
  const isAmex = /^3[47]/.test(digits)
  if (isAmex) {
    // 4-6-5 grouping for Amex
    const p1 = digits.slice(0, 4)
    const p2 = digits.slice(4, 10)
    const p3 = digits.slice(10, 15)
    return [p1, p2, p3].filter(Boolean).join(" ")
  }
  // Standard 4-4-4-4 grouping
  const chunks = digits.match(/.{1,4}/g)
  return chunks ? chunks.join(" ") : ""
}

export function formatExpiry(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 4)
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }
  return digits
}

export function validateExpiry(value) {
  const sanitized = String(value || "").trim()
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(sanitized)) {
    return false
  }

  const [monthStr, yearStr] = sanitized.split("/")
  const expMonth = parseInt(monthStr, 10)
  const expYear = parseInt(`20${yearStr}`, 10)

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  if (expYear < currentYear) return false
  if (expYear === currentYear && expMonth < currentMonth) return false
  if (expYear > currentYear + 20) return false

  return true
}

export function validateCVV(cvv, cardBrand = "Card") {
  const sanitized = String(cvv || "").replace(/\D/g, "")
  if (cardBrand === "American Express") {
    return sanitized.length === 4
  }
  return sanitized.length === 3 || sanitized.length === 4
}
