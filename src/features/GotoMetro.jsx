import ConnectCurrLoc from "./ConnectCurrLoc";
import ConnectTrain from "./ConnectTrain";
import ConnectWalk from "./COnnectWalk";
import "./css/GotoMetro.css";

export default function GotoMetro({ children }) {
  return <div className="go-to-metro">{children}</div>;
}
