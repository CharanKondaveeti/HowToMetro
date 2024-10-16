import "./css/ConnectTrain.css";

export default function ConnectWalk({ to, from }) {
  return (
    <div className="connect--walk">
      <div>
        <span></span>
        <p>
          change line {to} to {from}
        </p>
      </div>
    </div>
  );
}
