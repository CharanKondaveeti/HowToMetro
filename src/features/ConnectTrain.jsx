import "./css/ConnectTrain.css";

export default function ConnectTrain({ to, from, instructions }) {
  return (
    <div className="connect--train">
      <div>
        <span className="circle--point"></span>
        <p>{from}</p>
      </div>
      <div>
        <span></span>
        <p></p>
      </div>
      <div>
        <span className="circle--point"></span>
        <p>{to}</p>
      </div>
    </div>
  );
}
