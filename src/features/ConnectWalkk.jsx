import "./css/ConnectTrain.css";

const lineColors = {
  blue: "#364fc7", // Replace with actual line names and colors
  red: "#e03131",
  green: "#00755a",
};

export default function ConnectWalk({ to, from }) {
  return (
    <div className="connect--walk">
      <div>
        <span></span>
        <div>
          <span></span>
          <p>
            change line{" "}
            <span style={{ backgroundColor: lineColors[from] }}></span>
            to <span style={{ backgroundColor: lineColors[to] }}></span>
          </p>
          <span></span>
        </div>
      </div>
    </div>
  );
}
