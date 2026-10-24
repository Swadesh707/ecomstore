import { GetRequest, PostRequest } from "../config/http"

export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]")
  } catch {
    return []
  }
}

export const addToCart = (product, quantity = 1, size = "M", color = "Black") => {
  const cart = getCart()
  const existingIndex = cart.findIndex(
    (item) => item._id === product._id && item.size === size && item.color === color
  )

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity
  } else {
    cart.push({
      _id: product._id,
      title: product.title || product.name,
      name: product.title || product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity,
      size,
      color,
    })
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  window.dispatchEvent(new Event("cart-updated"))
}

export const getWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem("wishlist") || "[]")
  } catch {
    return []
  }
}

export const toggleWishlist = async (product) => {
  const wishlist = getWishlist()
  const exists = wishlist.some((item) => item._id === product._id)
  let updated

  if (exists) {
    updated = wishlist.filter((item) => item._id !== product._id)
  } else {
    updated = [
      ...wishlist,
      {
        _id: product._id,
        title: product.title || product.name,
        name: product.title || product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      },
    ]
  }

  localStorage.setItem("wishlist", JSON.stringify(updated))
  window.dispatchEvent(new Event("wishlist-updated"))

  // If authenticated patron, persist directly to MongoDB user document
  const token = localStorage.getItem("token")
  if (token && product._id) {
    try {
      await PostRequest("user/wishlist/toggle", { productId: product._id })
    } catch (err) {
      console.error("Wishlist remote persistence notice:", err)
    }
  }

  return !exists
}

export const syncUserWishlistWithDB = async () => {
  const token = localStorage.getItem("token")
  if (!token) return

  try {
    const local = getWishlist()
    const localIds = local.map((item) => item._id).filter(Boolean)

    if (localIds.length > 0) {
      const res = await PostRequest("user/wishlist/sync", { productIds: localIds })
      if (res.data?.wishlist) {
        localStorage.setItem("wishlist", JSON.stringify(res.data.wishlist))
        window.dispatchEvent(new Event("wishlist-updated"))
        return
      }
    }

    const res = await GetRequest("user/wishlist")
    if (Array.isArray(res.data)) {
      localStorage.setItem("wishlist", JSON.stringify(res.data))
      window.dispatchEvent(new Event("wishlist-updated"))
    }
  } catch (err) {
    console.error("Failed to sync wishlist with database:", err)
  }
}
