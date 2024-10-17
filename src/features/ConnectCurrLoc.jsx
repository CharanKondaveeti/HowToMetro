import "./css/ConnectTrain.css";

export default function ConnectCurrLoc({ from }) {
  return from === "Current Location" ? (
    <div className="connect--curr-loc">
      <div>
        <span className="circle--point"></span>
        <p>{from}</p>
      </div>
      <div>
        <span></span>
      </div>
    </div>
  ) : (
    <div className="connect--curr-loc">
      <div></div>
      <div>
        <span className="circle--point"></span>
        <p>Final Destination</p> {/* Fixed text capitalization */}
      </div>
    </div>
  );
}
