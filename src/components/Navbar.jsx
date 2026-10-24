import { useState, useEffect } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import {
  Container,
  Group,
  ActionIcon,
  Badge,
  Drawer,
  Avatar,
  Button,
  Text,
  Stack,
  Divider,
} from "@mantine/core"
import {
  ShoppingBag,
  Search,
  CircleUserRound,
  LogOut,
  Menu,
  ShieldCheck,
  FileText,
  Truck,
  Package,
} from "lucide-react"
import { getCart, getWishlist } from "../utils/cartStore"
import { GetRequest } from "../config/http"

export default function Navbar() {
  const [profileOpened, setProfileOpened] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [userName, setUserName] = useState(localStorage.getItem("name"))
  const [userEmail, setUserEmail] = useState(localStorage.getItem("email"))
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "")
  const [dbCategories, setDbCategories] = useState([])

  const navigate = useNavigate()

  // Fetch categories dynamically from MongoDB
  useEffect(() => {
    const fetchCategoriesFromDB = async () => {
      try {
        const res = await GetRequest("category/getAll")
        if (Array.isArray(res.data) && res.data.length > 0) {
          setDbCategories(res.data.map((c) => c.title))
        } else {
          // Fallback to distinct categories from products in DB
          const prodRes = await GetRequest("products")
          const cats = [...new Set(prodRes.data.map((p) => p.category).filter(Boolean))]
          setDbCategories(cats)
        }
      } catch (err) {
        console.error("Error fetching categories from DB for navbar:", err)
      }
    }

    fetchCategoriesFromDB()
  }, [])

  const syncState = () => {
    const cart = getCart()
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
    setCartCount(totalItems)

    const wishlist = getWishlist()
    setWishlistCount(wishlist.length)

    setToken(localStorage.getItem("token"))
    setUserName(localStorage.getItem("name"))
    setUserEmail(localStorage.getItem("email"))
    setUserRole(localStorage.getItem("role") || "")
  }

  useEffect(() => {
    syncState()

    window.addEventListener("cart-updated", syncState)
    window.addEventListener("wishlist-updated", syncState)
    window.addEventListener("storage", syncState)

    return () => {
      window.removeEventListener("cart-updated", syncState)
      window.removeEventListener("wishlist-updated", syncState)
      window.removeEventListener("storage", syncState)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("name")
    localStorage.removeItem("email")
    setToken(null)
    setUserName("")
    setUserEmail("")
    setProfileOpened(false)
    navigate("/")
  }

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }

  const getDisplayName = () => {
    if (!userName) return "Account"
    const lower = userName.toLowerCase()
    if (lower.includes("admin")) return "admin"
    if (lower.includes("sales")) return "salesperson"
    if (lower.includes("logistics")) return "logistics"
    if (lower.includes("user") || lower.includes("customer") || lower.includes("patron")) return "user"
    return userName
  }

  const getDisplayRole = () => {
    if (!userRole) return ""
    const lower = userRole.toLowerCase()
    if (lower.includes("admin")) return "admin"
    if (lower.includes("sales")) return "salesperson"
    if (lower.includes("logistics")) return "logistics"
    if (lower.includes("user")) return "user"
    return userRole.toLowerCase()
  }

  return (
    <>
      {/* Simple, Unbloated Navbar */}
      <nav className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E5DFD5]">
        <Container size="xl" className="h-16">
          <Group justify="space-between" align="center" className="h-full">
            {/* Minimal Brand Title */}
            <Link
              to="/"
              onClick={handleScrollToTop}
              className="no-underline flex items-center gap-2.5 group cursor-pointer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#C5A059] shrink-0 group-hover:scale-105 transition-transform"
              >
                <path
                  d="M12 2L2 9L12 22L22 9L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 9H22M12 2L7 9L12 22L17 9L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-serif font-bold text-xl tracking-[0.2em] text-[#1A1816]">
                ECOMSTORE
              </span>
            </Link>

            {/* Main Simple Navigation Links: Home, Shop, Sale, About */}
            <Group gap={28} visibleFrom="md">
              <NavLink
                to="/"
                onClick={handleScrollToTop}
                className={({ isActive }) =>
                  `text-xs font-semibold uppercase tracking-[0.18em] no-underline transition-colors cursor-pointer ${
                    isActive ? "text-[#1A1816] font-bold border-b border-[#1A1816] pb-0.5" : "text-[#8E877E] hover:text-[#1A1816]"
                  }`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `text-xs font-semibold uppercase tracking-[0.18em] no-underline transition-colors ${
                    isActive ? "text-[#1A1816] font-bold border-b border-[#1A1816] pb-0.5" : "text-[#8E877E] hover:text-[#1A1816]"
                  }`
                }
              >
                Shop
              </NavLink>

              <NavLink
                to="/sale"
                className={({ isActive }) =>
                  `text-xs font-semibold uppercase tracking-[0.18em] no-underline transition-colors ${
                    isActive ? "text-[#78281F] font-bold border-b border-[#78281F] pb-0.5" : "text-[#8E877E] hover:text-[#78281F]"
                  }`
                }
              >
                Sale
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `text-xs font-semibold uppercase tracking-[0.18em] no-underline transition-colors ${
                    isActive ? "text-[#1A1816] font-bold border-b border-[#1A1816] pb-0.5" : "text-[#8E877E] hover:text-[#1A1816]"
                  }`
                }
              >
                About
              </NavLink>
            </Group>

            {/* Right Icons + Profile Trigger */}
            <Group gap={14} align="center">
              {/* Search */}
              <ActionIcon
                variant="subtle"
                color="dark"
                size="md"
                onClick={() => navigate("/shop")}
                aria-label="Search"
                className="text-[#1A1816] hover:bg-[#F2EFE9]"
              >
                <Search size={18} strokeWidth={1.8} />
              </ActionIcon>

              {/* Shopping Bag with Badge */}
              <div className="relative">
                <ActionIcon
                  variant="subtle"
                  color="dark"
                  size="md"
                  onClick={() => navigate("/cart")}
                  aria-label="Bag"
                  className="text-[#1A1816] hover:bg-[#F2EFE9]"
                >
                  <ShoppingBag size={18} strokeWidth={1.8} />
                </ActionIcon>
                {cartCount > 0 && (
                  <Badge
                    size="xs"
                    circle
                    color="dark"
                    className="absolute -top-1 -right-1 text-[9px] pointer-events-none"
                  >
                    {cartCount}
                  </Badge>
                )}
              </div>

              {/* Profile / Account Trigger */}
              <button
                onClick={() => setProfileOpened(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E5DFD5] hover:border-[#1A1816] bg-[#FAF8F5] hover:bg-[#F2EFE9] text-xs font-semibold uppercase tracking-wider text-[#1A1816] transition-colors cursor-pointer rounded-none"
                title="Account Menu"
                aria-label="Account"
              >
                <CircleUserRound size={18} strokeWidth={1.7} className="text-[#1A1816]" />
                <span className="hidden sm:inline text-[11px] font-semibold">
                  {getDisplayName()}
                </span>
              </button>
            </Group>
          </Group>
        </Container>
      </nav>

      {/* Mantine Profile Drawer */}
      <Drawer
        opened={profileOpened}
        onClose={() => setProfileOpened(false)}
        position="right"
        size="md"
        padding="xl"
        title={
          <Text fw={700} size="sm" className="font-serif tracking-wider uppercase text-[#1A1816]">
            Account
          </Text>
        }
        styles={{
          content: { backgroundColor: "#FAF8F5" },
          header: { backgroundColor: "#FAF8F5", borderBottom: "1px solid #E5DFD5" },
        }}
      >
        <Stack gap="lg" mt="xs">
          {/* User Profile Card Section */}
          <div className="p-4 bg-[#F2EFE9] border border-[#E5DFD5] flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1A1816] text-[#FAF8F5] flex items-center justify-center font-serif text-lg font-bold shrink-0">
              {getDisplayName() ? (
                getDisplayName().charAt(0).toUpperCase()
              ) : (
                <CircleUserRound size={26} strokeWidth={1.6} className="text-[#C5A059]" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <Text fw={700} size="sm" className="font-serif text-[#1A1816] truncate">
                {getDisplayName()}
              </Text>
              <Text size="xs" c="dimmed" className="truncate">
                {userEmail || (token ? "Signed in" : "Guest")}
              </Text>
              {token && userRole && (
                <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#C5A059]/20 text-[#8B6E33] border border-[#C5A059]/40">
                  {getDisplayRole()}
                </span>
              )}
            </div>
          </div>

          {/* Customer Orders & Account Portal */}
          {token ? (
            <button
              onClick={() => {
                setProfileOpened(false)
                navigate("/account")
              }}
              className="w-full p-3 bg-[#C5A059] hover:bg-[#b59048] text-[#1A1816] flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              <span className="flex items-center gap-2">
                <Package size={15} />
                <span>Orders & Purchases</span>
              </span>
              <span className="text-xs font-bold">&rarr;</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setProfileOpened(false)
                navigate("/account?tab=track")
              }}
              className="w-full p-3 bg-[#C5A059] hover:bg-[#b59048] text-[#1A1816] flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              <span className="flex items-center gap-2">
                <Truck size={15} />
                <span>Orders & Purchases</span>
              </span>
              <span className="text-xs font-bold">&rarr;</span>
            </button>
          )}

          {/* Quick Direct Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setProfileOpened(false)
                navigate("/cart")
              }}
              className="p-3 bg-[#FAF8F5] border border-[#E5DFD5] hover:border-[#1A1816] flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#1A1816] cursor-pointer"
            >
              <span>Cart</span>
              <Badge size="xs" color="dark" circle>{cartCount}</Badge>
            </button>

            <button
              onClick={() => {
                setProfileOpened(false)
                navigate("/wishlist")
              }}
              className="p-3 bg-[#FAF8F5] border border-[#E5DFD5] hover:border-[#1A1816] flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#1A1816] cursor-pointer"
            >
              <span>Wishlist</span>
              <Badge size="xs" color="gray" circle>{wishlistCount}</Badge>
            </button>
          </div>

          <Divider color="#E5DFD5" mt="auto" />

          {/* Authentication Actions */}
          {token ? (
            <Button
              variant="outline"
              color="dark"
              radius="0"
              fullWidth
              onClick={handleLogout}
              leftSection={<LogOut size={14} />}
              className="text-xs font-bold uppercase tracking-wider border-[#1A1816]"
            >
              Sign Out
            </Button>
          ) : (
            <Button
              variant="filled"
              color="dark"
              radius="0"
              fullWidth
              onClick={() => {
                setProfileOpened(false)
                navigate("/login")
              }}
              className="text-xs font-bold uppercase tracking-wider bg-[#1A1816] text-[#FAF8F5]"
            >
              Sign In / Register
            </Button>
          )}
        </Stack>
      </Drawer>
    </>
  )
}