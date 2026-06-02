import lt3_logo from "../assets/image.png";

export function TitleBox(): React.ReactElement {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div className="mainTitle">
        <img className="logo" src={lt3_logo} alt="Меньше чем три"></img>
        <h1 className="titleText">PARASOCIAL CINEMA</h1>
      </div>
    </div>
  );
}
