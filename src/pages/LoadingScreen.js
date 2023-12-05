// import { Slider } from "@mui/material";
// import React, { Component } from "react";
// import ac1 from "../images/albumcovers/1.jpg";
// import { PlayArrow, SkipNext, SkipPrevious } from "@mui/icons-material";
// import anime from "animejs";

// class LoadingScreen extends Component {
//     constructor(props) {
//         super(props);
//         this.state = { sliderValue: 0, randomTime: this.generateRandomTime() };
//         this.sliderRef = React.createRef();
//     }

//     componentDidUpdate(prevProps) {
//         // Check if the external progress has changed
//         if (prevProps.externalProgress !== this.props.externalProgress) {
//             // Animate the slider to the new progress value
//             this.animateSlider(this.props.externalProgress);
//         }
//     }

//     generateRandomTime = () => {
//         const randomMinutes = Math.floor(Math.random() * (4 - 2 + 1)) + 2;
//         let randomSeconds;
//         if (randomMinutes === 2) {
//             randomSeconds = Math.floor(Math.random() * (59 - 30 + 1)) + 30;
//         } else if (randomMinutes === 4) {
//             randomSeconds = Math.floor(Math.random() * (15 - 0 + 1));
//         } else {
//             randomSeconds = Math.floor(Math.random() * 60);
//         }
//         return `${randomMinutes.toString().padStart(2, "0")}:${randomSeconds
//             .toString()
//             .padStart(2, "0")}`;
//     };

//     animateSlider = (targetValue) => {
//         anime({
//             targets: this.state,
//             sliderValue: targetValue,
//             easing: "linear",
//             duration: 500, // Adjust the animation duration as needed
//             update: () => {
//                 // Update the slider component's value
//                 this.sliderRef.current.value = this.state.sliderValue;
//             },
//         });
//     };

//     handleButtonClick = () => {
//         const targetValue = 50; // Replace with your desired target value
//         this.animateSlider(targetValue);
//     };

//     render() {
//         return (
//             <div
//                 style={{
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                     height: "100vh",
//                     justifyContent: "center",
//                     backgroundColor: "#1f1f1f",
//                 }}
//             >
//                 <div
//                     style={{
//                         position: "relative",
//                         height: 270,
//                         width: 270,
//                     }}
//                 >
//                     <img
//                         style={{
//                             width: 270,
//                             height: 270,
//                             position: "absolute",
//                             top: 0,
//                             left: 0,
//                             borderRadius: 10,
//                             filter: "blur(10px)",
//                         }}
//                         src={ac1}
//                     />
//                     <img
//                         style={{
//                             width: 270,
//                             height: 270,
//                             top: 0,
//                             left: 0,
//                             borderRadius: 10,
//                             position: "absolute",
//                         }}
//                         src={ac1}
//                     />
//                 </div>

//                 <div
//                     style={{
//                         fontFamily: "Nunito-Medium",
//                         color: "#fff",
//                         marginTop: 20,
//                         fontSize: 20,
//                         width: 270,
//                         textAlign: "left",
//                     }}
//                 >
//                     I Wonder
//                 </div>
//                 <div
//                     style={{
//                         fontFamily: "Nunito-Light",
//                         color: "#bbb",
//                         fontSize: 16,
//                         width: 270,
//                         textAlign: "left",
//                     }}
//                 >
//                     Kanye West
//                 </div>
//                 <div style={{ fontSize: 20, color: "#fff" }}>
//                     {this.state.sliderValue}
//                 </div>

//                 <div
//                     style={{
//                         fontFamily: "Nunito-Medium",
//                         fontSize: 16,
//                         color: "#E6FFF0",
//                         width: 400,
//                         flexDirection: "row",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "space-between",
//                         marginTop: 20,
//                     }}
//                 >
//                     {"0:00"}
//                     <Slider
//                         ref={this.sliderRef}
//                         value={this.state.sliderValue}
//                         min={0}
//                         max={100}
//                         sx={{
//                             color: "#fff",
//                             height: 4,
//                             width: 300,
//                             "& .MuiSlider-thumb": {
//                                 width: 16,
//                                 height: 16,
//                                 "&:before": {
//                                     boxShadow: "none",
//                                 },
//                                 "&:hover, &.Mui-focusVisible": {
//                                     boxShadow: "none",
//                                 },
//                             },
//                             "& .MuiSlider-rail": {
//                                 opacity: 0.28,
//                             },
//                         }}
//                     />
//                     {this.state.randomTime}
//                 </div>
//                 <div
//                     style={{
//                         width: 200,
//                         marginTop: 30,
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                     }}
//                 >
//                     <SkipPrevious sx={{ color: "#fff", fontSize: 36 }} />
//                     <PlayArrow
//                         sx={{ color: "#fff", fontSize: 48 }}
//                         onClick={this.handleButtonClick}
//                     />
//                     <SkipNext sx={{ color: "#fff", fontSize: 36 }} />
//                 </div>
//             </div>
//         );
//     }
// }

// export default LoadingScreen;
