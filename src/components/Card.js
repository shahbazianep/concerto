import fx from "money";
import { stateAbbreviations } from "../utils/states";
import "../styles.css";
import { conversionRates } from "../utils/conversionRates";
import { Place, WatchLater } from "@mui/icons-material";

fx.base = "USD";
fx.rates = conversionRates;

export default function Card(props) {
    function convertTime(localTime) {
        let [hours, minutes] = localTime.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        minutes = String(minutes).padStart(2, "0");
        return `${hours}:${minutes} ${period}`;
    }

    function convertCurrency(originalPrice, currencyType) {
        const price = fx(originalPrice).from(currencyType).to("USD");
        if (price <= 50) {
            return "$";
        } else if (price <= 100) {
            return "$$";
        } else if (price <= 150) {
            return "$$$";
        } else {
            return "$$$$";
        }
    }

    const price =
        props.prices === -1
            ? ""
            : convertCurrency(props.prices[0].min, props.prices[0].currency);

    const date = new Date(props.localDate);

    const stateAbbr = stateAbbreviations.hasOwnProperty(props.state)
        ? stateAbbreviations[props.state]
        : props.state;

    return (
        <div
            className={"concertCardContainer"}
            onClick={() => {
                window.open(props.url, "_blank");
            }}
        >
            <div
                style={{
                    backgroundColor: "#5339f8",
                    color: "#fefefe",
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    padding: "6px 6px 2px 6px",
                    fontSize: 12,
                    width: 36,
                    textAlign: "center",
                }}
            >
                {date
                    .toLocaleString("default", {
                        month: "short",
                    })
                    .toUpperCase()}
            </div>
            <div
                style={{
                    backgroundColor: "#fefefe",
                    color: "#0d1014",
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    padding: "0px 6px 2px 6px",
                    fontSize: 20,
                    width: 36,
                    textAlign: "center",
                }}
            >
                {String(date.getMonth() + 1).padStart(2, "0")}
            </div>
            {/* <span className={"concertCardDateText"}>
                {convertDate(props.localDate)}
            </span> */}

            <span className={"concertCardLocationText"}>
                {props.city + ", " + stateAbbr}
            </span>
            <div className={"concertCardDetailText"}>
                <Place sx={{ fontSize: 16, marginRight: 1 }} />
                {props.venue}
            </div>
            <div className={"concertCardDetailText"}>
                <WatchLater sx={{ fontSize: 16, marginRight: 1 }} />
                {convertTime(props.time)}
            </div>
            <div className={"concertCardPriceText"}>{price}</div>
        </div>
    );
}
