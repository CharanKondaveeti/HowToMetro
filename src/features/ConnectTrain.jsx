import "./css/ConnectTrain.css";

const lineColors = {
  blue: "#364fc7", // Replace with actual line names and colors
  red: "#e03131",
  green: "#00755a",
};

export default function ConnectTrain({ to, from, color }) {
  console.log(to, from, color);
  return (
    <div className="connect--train">
      <div>
        <span
          style={{ backgroundColor: lineColors[color] }}
          className="circle--point"
        ></span>
        <p>{from}</p>
      </div>
      <div>
        <span style={{ backgroundColor: lineColors[color] }}></span>
        <p></p>
      </div>
      <div>
        <span className="circle--point"></span>
        <p>{to}</p>
      </div>
    </div>
  );
}
