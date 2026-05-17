import Logo from "../ui/logo";
import { Bell, Cog, CircleUserRound } from "lucide-react"

export default function NavBar() {
  return (
    <nav className="w-full h-16 bg-background border-b border-border flex items-center">
      <div id="tabs" className="flex-1 flex justify-start items-center gap-4 ml-4">
        <div id="brand" className="flex justify-center items-center gap-2">
          <Logo />
          <span className="text-lg text-primary text-center font-bold">Secret Santa</span>
        </div>
        <ul id="links" className="flex-1 flex justify-start items-center gap-4 ml-4 font-bold">
          <li className="text-text-muted hover:text-primary hover:cursor-pointer">Groups</li>
          <li className="text-text-muted hover:text-primary hover:cursor-pointer">Create</li>
        </ul>
      </div>
      <div id="options">
        <ul id="icons" className="flex-1 flex justify-end items-center gap-4 mr-4">
          <li id="alerts" className="flex justify-center items-center text-text-muted gap-4">
            <button>
              <Bell className="hover:cursor-pointer hover:text-primary"/>
            </button>
            <button>
              <Cog className="hover:cursor-pointer hover:text-primary"/>
            </button>
            <button>
              <CircleUserRound className="hover:cursor-pointer hover:text-primary"/>
            </button>
          </li>
          <li id="settings" className="flex justify-center items-center"></li>
          <li id="profile" className="flex justify-center items-center"></li>
        </ul>
      </div>
    </nav>
  );
}
