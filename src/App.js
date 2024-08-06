import React from "react";
import { Routes, Route } from "react-router";
import { BrowserRouter } from "react-router-dom";

import Home from "./pages/Home.js";
import Results from "./pages/Results.js";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ImageRotator from "./components/ImageRotator.js";

function importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
}
const albumCovers = importAll(
    require.context("./images/albumcovers", false, /\.(png|jpe?g|svg)$/)
);

export default function App() {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <BrowserRouter>
                <Routes>
                    <Route
                        index
                        element={
                            <Home
                                children={<ImageRotator images={albumCovers} />}
                            />
                        }
                    ></Route>
                    <Route path="results" element={<Results />}></Route>
                </Routes>
            </BrowserRouter>
        </LocalizationProvider>
    );
}
