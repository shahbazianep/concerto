import fx from "money";
import { stateAbbreviations } from "../utils/states";
import "../styles.css";
import { conversionRates } from "../utils/conversionRates";

fx.base = "USD";
fx.rates = conversionRates;

export default function Card(props) {
    function convertDate(localDate) {
        const dateObj = new Date(localDate);

        const month = dateObj.getMonth() + 1; // Adding 1 because months are zero-based (January is 0).
        const day = dateObj.getDate() + 1;

        return `${month}/${day}`;
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
            <span className={"concertCardDateText"}>
                {convertDate(props.localDate)}
            </span>

            <span className={"concertCardLocationText"}>
                {props.city + ", " + stateAbbr}
            </span>
            <div
                className={"concertCardNameText"}
                style={{
                    width: 190 - price.length * 5,
                }}
            >
                {props.name}
            </div>
            <div className={"concertCardPriceText"}>{price}</div>
        </div>
    );
}
