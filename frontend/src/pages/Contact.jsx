import React, { useState } from 'react';
import MainNavbar from '../components/MainNavbar';

const Contact = () => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <MainNavbar showLogin={showLogin} onLoginClick={() => setShowLogin(!showLogin)} />
      <section className="contact-section" style={{ background: '#f8fafc', padding: '0 0 3rem 0', minHeight: 600 }}>
        {/* 1. Page Header / Title Section */}
        <div style={{
          background: '#fff',
          borderRadius: '0 0 24px 24px',
          boxShadow: '0 2px 12px rgba(124,38,58,0.07)',
          padding: '2.2rem 2rem 1.2rem 2rem',
          textAlign: 'center',
          marginBottom: 0,
          marginTop: 24
        }}>
          <h1 style={{ fontWeight: 800, fontSize: '2.2rem', marginBottom: 8, color: '#7c263a', letterSpacing: '0.01em' }}>Contact Us</h1>
          <div style={{ fontSize: '1.13rem', color: '#4a5568', fontStyle: 'italic', opacity: 0.93 }}>We'd love to hear from you! Reach out for support, questions, or feedback.</div>
        </div>

        {/* 2 & 3. Contact Form + Info Box */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', alignItems: 'flex-start',
          maxWidth: 1100, margin: '2.5rem auto 0 auto'
        }}>
          {/* Contact Form Card */}
          <div style={{
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 2px 12px rgba(124,38,58,0.08)',
            padding: '2rem 2rem 1.5rem 2rem',
            minWidth: 320,
            flex: '1 1 350px',
            maxWidth: 480
          }}>
            <form id="contactForm" onSubmit={e => { e.preventDefault(); setContactSubmitted(true); }}>
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="contactName" style={{ fontWeight: 600, color: '#7c263a', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span>👤</span> Full Name
                </label>
                <input id="contactName" type="text" required className="form-control" style={{ borderRadius: 12, border: '1.5px solid #e2e8f0', marginTop: 4, padding: '10px 12px', fontSize: '1rem' }} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="contactEmail" style={{ fontWeight: 600, color: '#7c263a', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span>📧</span> Email Address
                </label>
                <input id="contactEmail" type="email" required className="form-control" style={{ borderRadius: 12, border: '1.5px solid #e2e8f0', marginTop: 4, padding: '10px 12px', fontSize: '1rem' }} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="contactSubject" style={{ fontWeight: 600, color: '#7c263a', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span>📝</span> Subject
                </label>
                <input id="contactSubject" type="text" required className="form-control" style={{ borderRadius: 12, border: '1.5px solid #e2e8f0', marginTop: 4, padding: '10px 12px', fontSize: '1rem' }} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="contactMessage" style={{ fontWeight: 600, color: '#7c263a', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span>💬</span> Message
                </label>
                <textarea id="contactMessage" required rows={4} className="form-control" style={{ borderRadius: 12, border: '1.5px solid #e2e8f0', marginTop: 4, padding: '10px 12px', fontSize: '1rem', resize: 'vertical' }} />
              </div>
              <button type="submit" className="btn" style={{ width: '100%', background: 'linear-gradient(90deg, #7c263a 0%, #f6c342 100%)', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: '1.08rem', padding: '12px 0', marginTop: 8, boxShadow: '0 2px 8px rgba(124,38,58,0.08)' }}>
                📤 Submit Inquiry
              </button>
              {contactSubmitted && (
                <div style={{ marginTop: 18, color: '#38a169', fontWeight: 600, textAlign: 'center', fontSize: '1.05rem' }}>
                  Thank you! We’ll get back to you soon.
                </div>
              )}
            </form>
          </div>
          {/* Contact Info Box */}
          <div style={{
            background: 'rgba(246,195,66,0.10)',
            borderRadius: 16,
            boxShadow: '0 1.5px 8px rgba(124,38,58,0.07)',
            padding: '2rem 1.5rem',
            minWidth: 260,
            flex: '1 1 260px',
            maxWidth: 350,
            display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', alignItems: 'flex-start', border: '1.5px solid #e2e8f0'
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 6, color: '#7c263a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📍</span> Contact Information
            </div>
            <div style={{ color: '#4a5568', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📧</span> <a href="mailto:capstone.archive@buksu.edu.ph" style={{ color: '#667eea', textDecoration: 'underline' }}>capstone.archive@buksu.edu.ph</a>
            </div>
            <div style={{ color: '#4a5568', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📞</span> +63 912 345 6789
            </div>
            <div style={{ color: '#4a5568', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏫</span> IT Department, Bukidnon State University
            </div>
            <div style={{ color: '#4a5568', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🕐</span> Office Hours: Monday – Friday, 8:00 AM – 5:00 PM
            </div>
            {/* Social Media Buttons (optional) */}
            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <a href="#" style={{ background: '#4267B2', color: '#fff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', textDecoration: 'none' }} title="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#" style={{ background: '#E1306C', color: '#fff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', textDecoration: 'none' }} title="Instagram"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>

        {/* 4. Google Map Embed (Optional) */}
        <div style={{ maxWidth: 900, margin: '2.5rem auto 0 auto', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1.5px 8px rgba(124,38,58,0.07)' }}>
          <iframe
            title="BukSU Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.282073262316!2d125.145!3d8.157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32ff8d1e2b1e2b1f%3A0x7c263a!2sBukidnon%20State%20University!5e0!3m2!1sen!2sph!4v1680000000000!5m2!1sen!2sph"
            width="100%"
            height="220"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        {/* 5. FAQ Section */}
        <div style={{ maxWidth: 900, margin: '2.5rem auto 0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(124,38,58,0.08)', padding: '1.5rem 1.5rem 1.2rem 1.5rem', border: '1.5px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: '1.3rem' }}>🙋‍♂️</span>
            <span style={{ fontWeight: 700, fontSize: '1.08rem' }}>FAQ / Help</span>
          </div>
          <div style={{ marginBottom: 10 }}>
            <b>Q:</b> Can I submit my capstone project online?<br />
            <b>A:</b> Yes! Just go to the Submit page and fill in the required details.
          </div>
          <div>
            <b>Q:</b> Who can access the archive?<br />
            <b>A:</b> BukSU students, faculty, and anyone interested in research.
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact; 