import { Facebook, Twitter, Instagram, Github, Smile } from "lucide-react";
import { Container } from "../Container";
import FooterTop from "./FooterTop";

export default function Footer() {
  return (
    // <footer className="bg-secondary text-white mt-20">
    //   {/* Main Footer Content */}
    //   <div className="container mx-auto px-4 py-12">
    //     <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
    //       {/* Services */}
    //       <div>
    //         <h3 className="mb-4">Services</h3>
    //         <ul className="space-y-2 text-sm opacity-80">
    //           <li>
    //             <a href="#" className="hover:opacity-100">
    //               Bonus program
    //             </a>
    //           </li>
    //           <li>
    //             <a href="#" className="hover:opacity-100">
    //               Gift cards
    //             </a>
    //           </li>
    //           <li>
    //             <a href="#" className="hover:opacity-100">
    //               Credit and payment
    //             </a>
    //           </li>
    //           <li>
    //             <a href="#" className="hover:opacity-100">
    //               Service contracts
    //             </a>
    //           </li>
    //           <li>
    //             <a href="#" className="hover:opacity-100">
    //               Non-cash account
    //             </a>
    //           </li>
    //           <li>
    //             <a href="#" className="hover:opacity-100">
    //               Payment
    //             </a>
    //           </li>
    //         </ul>
    //       </div>

    //       {/* Help */}
    //       <div>
    //         <h3 className="mb-4">Help</h3>
    //         <ul className="space-y-2 text-sm opacity-80">
    //           <li>
    //             <a href="#" className="hover:opacity-100">
    //               Find an order
    //             </a>
    //           </li>
    //           <li>
    //             <a href="#" className="hover:opacity-100">
    //               Terms of delivery
    //             </a>
    //           </li>
    //           <li>
    //             <a href="#" className="hover:opacity-100">
    //               Exchange and return of goods
    //             </a>
    //           </li>
    //           <li>
    //             <a href="#" className="hover:opacity-100">
    //               Guarantee
    //             </a>
    //           </li>
    //           <li>
    //             <a href="#" className="hover:opacity-100">
    //               Frequently asked questions
    //             </a>
    //           </li>
    //           <li>
    //             <a href="#" className="hover:opacity-100">
    //               Terms of use of the site
    //             </a>
    //           </li>
    //         </ul>
    //       </div>

    //       {/* Contact */}
    //       <div>
    //         <h3 className="mb-4">Contact us</h3>
    //         <div className="space-y-2 text-sm opacity-80">
    //           <p>600 Seventh Street, Suite 204</p>
    //           <p>Fort Worth, TX 76104</p>
    //           <p className="mt-4">Monday - Friday: 9am - 5pm</p>
    //           <p>Saturday: 10am - 3pm</p>
    //           <p className="mt-4">Email: shop@email.com</p>
    //         </div>
    //       </div>

    //       {/* Newsletter */}
    //       <div>
    //         <h3 className="mb-4">Sign up to e-mail and updates</h3>
    //         <div className="flex gap-2 mb-6">
    //           <input
    //             type="email"
    //             placeholder="Email Address"
    //             className="flex-1 px-3 py-2 rounded bg-white text-gray-800 text-sm"
    //           />
    //           <button className="w-10 h-10 bg-primary rounded flex items-center justify-center flex-shrink-0 hover:bg-yellow-500 transition-colors">
    //             <Smile className="w-5 h-5 text-black" />
    //           </button>
    //         </div>
    //         <div className="flex gap-3">
    //           <a
    //             href="#"
    //             className="w-8 h-8 bg-white/10 rounded flex items-center justify-center hover:bg-white/20 transition-colors"
    //           >
    //             <Facebook className="w-4 h-4" />
    //           </a>
    //           <a
    //             href="#"
    //             className="w-8 h-8 bg-white/10 rounded flex items-center justify-center hover:bg-white/20 transition-colors"
    //           >
    //             <Twitter className="w-4 h-4" />
    //           </a>
    //           <a
    //             href="#"
    //             className="w-8 h-8 bg-white/10 rounded flex items-center justify-center hover:bg-white/20 transition-colors"
    //           >
    //             <Instagram className="w-4 h-4" />
    //           </a>
    //           <a
    //             href="#"
    //             className="w-8 h-8 bg-white/10 rounded flex items-center justify-center hover:bg-white/20 transition-colors"
    //           >
    //             <Github className="w-4 h-4" />
    //           </a>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Bottom Bar */}
    //     <div className="border-t border-blue-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
    //       <div className="flex gap-2">
    //         <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
    //           <span className="text-xs">💳</span>
    //         </div>
    //         <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
    //           <span className="text-xs">💳</span>
    //         </div>
    //         <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
    //           <span className="text-xs">💳</span>
    //         </div>
    //       </div>
    //       <p className="text-sm opacity-60">
    //         © 2024 Tekno. All rights reserved.
    //       </p>
    //     </div>
    //   </div>
    // </footer>
    <footer className="bg-[#050505] text-gray-300 border-t border-gray-800 mt-20 relative overflow-hidden">
      {/* Optional Glow at the bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-primary/5 blur-[120px] pointer-events-none rounded-full" />

      <Container className="relative z-10">
        {/* footer */}
        {/* Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          <div>
            <h3 className="mb-6 text-white font-bold text-lg tracking-wide uppercase">Services</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="#" className="hover:opacity-100">
                  Bonus program
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Gift cards
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Credit and payment
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Service contracts
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Non-cash account
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Payment
                </a>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-6 text-white font-bold text-lg tracking-wide uppercase">Help</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="#" className="hover:opacity-100">
                  Find an order
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Terms of delivery
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Exchange and return of goods
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Guarantee
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Frequently asked questions
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Terms of use of the site
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-white font-bold text-lg tracking-wide uppercase">Contact us</h3>
            <div className="space-y-2 text-sm opacity-80">
              <p>UIT</p>
              <p>Thu Duc City, Ho Chi Minh City, Vietnam</p>
              <p className="mt-4">Monday - Friday: 9am - 5pm</p>
              <p>Saturday: 8am - 10pm</p>
              <p className="mt-4">Email: tekno@gmail.com</p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-6 text-white font-bold text-lg tracking-wide uppercase">Sign up for updates</h3>
            <div className="flex gap-2 mb-8">
              <input
                type="email"
                required
                placeholder="Email Address"
                className="flex-1 px-4 py-3 rounded-xl bg-[#111111] border border-gray-800 text-gray-100 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              <button className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(255,213,0,0.2)]">
                <Smile className="w-6 h-6 text-black" />
              </button>
            </div>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-8 h-8 bg-white/10 rounded flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-white/10 rounded flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-white/10 rounded flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-white/10 rounded flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="py-8 flex items-center justify-between text-sm text-gray-500 border-t border-gray-800">
          <p>© 2026 Tekno. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-primary cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Privacy</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
