import { IoMdMenu } from "react-icons/io";
import { FaRegBell } from "react-icons/fa";
import './css/Navbar.css'

export default function Navbar() {
  return (
    <div className='nav--bar'>
    <IoMdMenu size={25} />
    <p>How To Metro</p>
    <FaRegBell size={20}/>
</div>
  )
}
