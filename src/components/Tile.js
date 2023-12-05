import "../styles.css";

export default function Tile(props) {
    return (
        <div>
            <div
                className="imageTileContainer"
                style={{
                    top: `calc(6vh + 26vh * ${props.coords[0]}`,
                    right: `calc(6vh + 26vh * ${props.coords[1]}`,
                }}
            >
                <img
                    style={{
                        width: props.zoom,
                        marginLeft: props.shift ? props.shift : 0,
                        marginTop: props.shiftTop ? props.shiftTop : 0,
                        transform: "rotate(-45deg)",
                        objectFit: "cover",
                    }}
                    src={props.image}
                ></img>
            </div>
        </div>
    );
}
