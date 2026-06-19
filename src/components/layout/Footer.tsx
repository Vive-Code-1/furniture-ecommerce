import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Shop */}
          <div>
            <h4 className="font-heading text-sm font-semibold mb-4 opacity-70">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-sm opacity-60 hover:opacity-100 transition-opacity">All Furniture</Link></li>
              <li><Link to="/products?category=Sofa" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Sofas</Link></li>
              <li><Link to="/products?category=Chair" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Chairs</Link></li>
              <li><Link to="/products?category=Bed" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Beds</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading text-sm font-semibold mb-4 opacity-70">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm opacity-60 hover:opacity-100 transition-opacity">About Modulive</Link></li>
              <li><Link to="/contact" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Contact</Link></li>
              <li><Link to="/track-order" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Order Tracking</Link></li>
            </ul>
          </div>

          {/* Logo */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-start">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary-foreground rounded-full flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-foreground rounded-full" />
              </div>
              <span className="font-heading text-lg font-bold">Modulive</span>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-heading text-sm font-semibold mb-4 opacity-70">Connect</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Instagram</a></li>
              <li><a href="#" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Facebook</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-sm font-semibold mb-4 opacity-70">Contact</h4>
            <ul className="space-y-2">
              <li className="text-sm opacity-60">12-B Street Lorem,<br />Ipsum</li>
              <li><a href="mailto:studio@modulive.com" className="text-sm opacity-60 hover:opacity-100 transition-opacity">studio@modulive.com</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-40">Created in 2025. Modulive All Rights Reserved</p>
          <div className="flex gap-6">
            <Link to="/about" className="text-xs opacity-40 hover:opacity-80 transition-opacity">About</Link>
            <Link to="/contact" className="text-xs opacity-40 hover:opacity-80 transition-opacity">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
