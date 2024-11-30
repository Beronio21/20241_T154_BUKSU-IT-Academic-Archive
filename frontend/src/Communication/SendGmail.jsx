import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

const SendGmail = () => {
  const form = useRef();
  const [emailSent, setEmailSent] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm('service_ovo3dyn', 'template_8wzmxwc', form.current, {
        publicKey: 'QmN8gJbNtqkmaTH9k',
      })
      .then(
        () => {
          console.log('Email sent successfully!');
          setEmailSent(true);
        },
        (error) => {
          console.error('Failed to send email:', error.text);
        },
      );
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <form ref={form} onSubmit={sendEmail}>
        <label>Name</label>
        <input type="text" name="from_name" required style={{ width: '100%', marginBottom: '10px' }} />
        <label>Email</label>
        <input type="email" name="from_email" required style={{ width: '100%', marginBottom: '10px' }} />
        <label>Message</label>
        <textarea name="message" required style={{ width: '100%', marginBottom: '10px' }} />
        <input type="submit" value="Send" style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }} />
      </form>
      {emailSent && <p style={{ color: 'green', marginTop: '10px' }}>Email sent successfully!</p>}
    </div>
  );
};

export default SendGmail;