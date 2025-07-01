import Footer from "../../components/Footer/Footer";
import Navigation from "../Navigation/Navigation";
import { Outlet, useLocation } from "react-router-dom";
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const isProgramacionPage = location.pathname === '/programacion';

  return (
    <div className={isProgramacionPage ? 'bg-[#c1f3e9]' : ''}>
      <Navigation />
      <Outlet />
      <div className="page-container">
        <Footer className="footer" />
      </div>
    </div>
  );
};

export default Layout;