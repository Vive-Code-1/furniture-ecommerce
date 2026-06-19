import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ShoppingBag, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Order Track", href: "/track-order" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, isCartOpen, setIsCartOpen } = useCart();
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "py-2" : "py-4"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between gap-4">
          {/* Logo — glassmorphism pill to match nav */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 pl-1.5 pr-4 py-1 rounded-full bg-foreground/10 dark:bg-foreground/20 backdrop-blur-xl border border-foreground/10 dark:border-foreground/15 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:bg-foreground/15 transition-colors"
          >
            <div className="w-7 h-7 bg-foreground rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-primary-foreground rounded-full" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight">Modulive</span>
          </Link>

          {/* Desktop Nav — glassmorphism rounded pill */}
          <nav
            aria-label="Main"
            className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full bg-foreground/10 dark:bg-foreground/20 backdrop-blur-xl border border-foreground/10 dark:border-foreground/15 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`relative px-4 lg:px-5 py-2 rounded-full text-sm font-body transition-all duration-300 ${
                    active
                      ? "bg-background text-foreground shadow-[0_4px_14px_rgba(0,0,0,0.12)] font-semibold"
                      : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions — grouped in a glass pill on desktop */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 px-1.5 py-1 rounded-full bg-foreground/10 dark:bg-foreground/20 backdrop-blur-xl border border-foreground/10 dark:border-foreground/15 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-foreground/10">
                <Search className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full hover:bg-foreground/10"
                onClick={() => setIsCartOpen(true)}
                aria-label="Open cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-foreground text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
              <Link to="/account" aria-label="Account">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-foreground/10">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Mobile actions (cart + menu only, stays handy) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden relative rounded-full bg-foreground/10 backdrop-blur-xl"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-foreground text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-full bg-foreground/10 backdrop-blur-xl"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-card">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-2 mt-8">
                  {navLinks.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.label}
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`px-4 py-3 rounded-full font-heading text-base transition-colors ${
                          active
                            ? "bg-foreground text-background font-semibold"
                            : "hover:bg-muted"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                  <div className="pt-4 mt-2 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-full font-heading text-base hover:bg-muted"
                  >
                    Account
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
};

export default Navbar;
