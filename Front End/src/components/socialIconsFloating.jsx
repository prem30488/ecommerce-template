import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube } from 'react-icons/fa';

const FloatingSocials = () => {
    return (
        <div id="floating-socials" style={{
            position: 'fixed',
            top: '50%',
            right: '0',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
        }}>
            <a href="https://www.facebook.com/hanleyhealthcare/" style={{ padding: '10px', background: '#3b5998', color: 'white' }}><FaFacebook size={24} /></a>
            <a href="https://www.twitter.com/hanleyhealthcare" style={{ padding: '10px', background: '#ff0000', color: 'white' }}><FaTwitter size={24} /></a>

            <a href="https://www.linkedin.com/company/hanley-healthcare/" style={{ padding: '10px', background: '#0077b5', color: 'white' }}><FaLinkedin size={24} /></a>
            <a href="https://www.youtube.com/@HanleyHealthcare" style={{ padding: '10px', background: '#ff0000', color: 'white' }}><FaYoutube size={24} /></a>
            <a href="https://www.instagram.com/hanleyhealthcare/" style={{ padding: '10px', background: '#1da1f2', color: 'white' }}><FaInstagram size={24} /></a>


        </div>
    );
};
export default FloatingSocials;