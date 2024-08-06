import "../styles.css";

export default function Tile(props) {
    return (
        <div
            className="imageTileContainer"
            style={{
                top: `calc(6vh + 26vh * ${props.coords[0]}`,
                right: `calc(6vh + 26vh * ${props.coords[1]}`,
            }}
            id={props.id}
        >
            <img
                style={{
                    width: "150%",
                    transform: "rotate(-45deg)",
                    objectFit: "cover",
                }}
                src={props.image}
            />
        </div>
    );
}
