import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Service */}
          <div>
            <h4 className="font-heading text-sm font-semibold mb-4 opacity-70">Service</h4>
            <ul className="space-y-2">
              <li><Link to="/legal" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Legal Policy</Link></li>
              <li><Link to="/privacy" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Data Protection</Link></li>
              <li><Link to="/track-order" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Order Tracking</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading text-sm font-semibold mb-4 opacity-70">Newsletter</h4>
            <ul className="space-y-2">
              <li><Link to="/articles" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Print Your Articles</Link></li>
              <li><Link to="/signup" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Sign Up</Link></li>
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
            <Link to="/terms" className="text-xs opacity-40 hover:opacity-80 transition-opacity">Terms of Service</Link>
            <Link to="/privacy" className="text-xs opacity-40 hover:opacity-80 transition-opacity">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
