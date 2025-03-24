import { Link } from 'react-router-dom';

const NotFound = () => {
  const jwtSecret = process.env.REACT_APP_JWT_SECRET;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Go to Login</Link>
    </div>
  );
};

export default NotFound;
