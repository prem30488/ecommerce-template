import { bubble as Menu } from "react-burger-menu";

export default function Sidebar() {
   return(
    <Menu pageWrapId={ "page-wrap" } outerContainerId={ "navbar" } >
        <main id="page-wrap">
            <a href="#" id="so" class="google" onclick="">www.hanleyhealthcare.com</a> 
            <br/>
            <a href="https://www.facebook.com/hanleyhealthcare/" class="facebook"><i class="fa fa-facebook"></i>
            Facebook
            </a> 
            <br/>
            <a href="#" class="twitter"><i class="fa fa-twitter">Twitter</i></a> <br/>
            <a href="#" class="google"><i class="fa fa-google"></i>Google</a> <br/>
            <a href="#" class="linkedin"><i class="fa fa-linkedin"></i>LinkedIn</a><br/>
            <a href="https://www.youtube.com/channel/UC-YbR20VcANUwhtWpr1hgCA/featured" class="youtube"><i class="fa fa-youtube"></i>
            Youtube Channel
            </a>
            </main>
        </Menu>
   )
}