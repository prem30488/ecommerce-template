import { bubble as Menu } from "react-burger-menu";

export default function Sidebar() {
   return(
    <Menu pageWrapId={ "page-wrap" } outerContainerId={ "navbar" } >
        <main id="page-wrap">
            <a href="#" id="so" className="google">www.hanleyhealthcare.com</a> 
            <br/>
            <a href="https://www.facebook.com/hanleyhealthcare/" className="facebook"><i className="fa fa-facebook"></i>
            Facebook
            </a> 
            <br/>
            <a href="#" className="twitter"><i className="fa fa-twitter">Twitter</i></a> <br/>
            <a href="#" className="google"><i className="fa fa-google"></i>Google</a> <br/>
            <a href="#" className="linkedin"><i className="fa fa-linkedin"></i>LinkedIn</a><br/>
            <a href="https://www.youtube.com/channel/UC-YbR20VcANUwhtWpr1hgCA/featured" className="youtube"><i className="fa fa-youtube"></i>
            Youtube Channel
            </a>
            </main>
        </Menu>
   )
}
