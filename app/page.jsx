import Image from "next/image";
export default function homePage() {
  return(
    <><h1>Be Wildfire Aware</h1>
    <p1> Stay Informed and Stay Safe</p1>   
    <h2>Dispatch Areas</h2>
    <p>Explore the current wildfire danger in your area</p>
    <button onclick="href='/data'">Explore Dispatch Areas</button>
    <img src="/images/FEMS_logo.png" width="301" height="47"/>
    <p>Weather and NFDRS data now coming from FEMS</p> 
    </>
  );
}