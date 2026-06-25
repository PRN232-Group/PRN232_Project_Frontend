import React from "react";
import "../styles/footer.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Footer() {
  return (
    <footer className="main-footer-bg">
      <div className="main-footer-container">

        {/* Brand */}
        <div className="main-footer-logo-block">
          <div className="main-footer-logo">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
              alt="logo"
              className="main-footer-logo-img"
            />
            <span className="main-footer-brand">Interior Studio</span>
          </div>

          <div className="main-footer-desc">
            We design and craft modern living spaces with a focus on elegance,
            functionality, and timeless aesthetics. Let’s build your dream space together.
          </div>
        </div>

        {/* Quick links */}
        <div className="main-footer-menu-block">
          <div className="main-footer-menu-title">Explore</div>
          <ul className="main-footer-menu">
            <li><a href="/collection">Collections</a></li>
            <li><a href="/design-3d">3D Design</a></li>
            <li><a href="/projects">Projects</a></li>
            <li><a href="/shop">Shop</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="main-footer-contact-block">
          <div className="main-footer-menu-title">Contact</div>

          <div className="main-footer-contact-item">
            <i className="fa-solid fa-location-dot"></i>
            <span>Ho Chi Minh City, Vietnam</span>
          </div>

          <div className="main-footer-contact-item">
            <i className="fa-solid fa-phone"></i>
            <a href="tel:+84900000000">+84 900 000 000</a>
          </div>

          <div className="main-footer-contact-item">
            <i className="fa-solid fa-envelope"></i>
            <a href="mailto:contact@interiorstudio.com">
              contact@interiorstudio.com
            </a>
          </div>

          <div className="main-footer-socials">
            <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="#"><i className="fa-brands fa-instagram"></i></a>
            <a href="#"><i className="fa-brands fa-pinterest-p"></i></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="main-footer-copyright">
        © {new Date().getFullYear()} Interior Studio. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;