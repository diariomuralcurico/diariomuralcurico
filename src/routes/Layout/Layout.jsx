import Footer from "../../components/Footer/Footer"
import Navigation from "../Navigation/Navigation"
import { Outlet } from "react-router-dom"

const Layout = () => {
  return (
    <div>
        <Navigation/>
        <Outlet/>
        <div className="page-container">

        <Footer className="footer"/>
        </div>
    </div>
  )
}

export default Layout