import React from 'react';
import { COMPANY_INFO } from '../constants/companyInfo';

const TermsOfUse = () => {
  return (
    <div style={{ backgroundColor: '#fcfdfa', minHeight: '100vh', padding: '120px 20px 80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#ffffff', padding: '60px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#1a3a3a', marginBottom: '10px', textAlign: 'center' }}>Terms of Use</h1>
        <p style={{ color: '#667c7c', textAlign: 'center', marginBottom: '40px', fontSize: '16px' }}>Last updated: November 5, 2025</p>

        <div style={{ color: '#334e4e', lineHeight: '1.8', fontSize: '17px' }}>
          <p>
            Welcome to {COMPANY_INFO.name}. These Terms of Use govern your use of our website and services. By accessing or using our website, you agree to be bound by these terms.
          </p>

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', color: '#1a3a3a' }}>1. Use of Service</h2>
          <p>
            You agree to use our services only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the services. Unauthorized use of this website may give rise to a claim for damages or be a criminal offense.
          </p>

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', color: '#1a3a3a' }}>2. Intellectual Property</h2>
          <p>
            This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice.
          </p>

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', color: '#1a3a3a' }}>3. Limitation of Liability</h2>
          <p>
            {COMPANY_INFO.name} will not be liable for any direct, indirect, incidental, special or consequential damages resulting from the use or the inability to use the services or for the cost of procurement of substitute goods and services.
          </p>

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', color: '#1a3a3a' }}>4. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Your continued use of the website after any changes indicates your acceptance of the new terms.
          </p>

          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '40px', marginBottom: '20px', color: '#1a3a3a' }}>Contact</h2>
          <p>
            For any questions regarding these terms, please contact:
          </p>
          <div style={{ backgroundColor: '#f4f9f4', padding: '30px', borderRadius: '16px', borderLeft: '5px solid #4CAF50', marginTop: '20px' }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#1a3a3a' }}>{COMPANY_INFO.name}</p>
            <p style={{ margin: '5px 0' }}>{COMPANY_INFO.address1},</p>
            <p style={{ margin: '5px 0' }}>{COMPANY_INFO.address2}, {COMPANY_INFO.city},</p>
            <p style={{ margin: '5px 0', fontWeight: 600 }}>{COMPANY_INFO.state} - {COMPANY_INFO.pinCode}, India</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
