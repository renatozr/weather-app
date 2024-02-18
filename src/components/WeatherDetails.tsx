import React from "react";
import { FiDroplet } from "react-icons/fi";
import { ImMeter } from "react-icons/im";
import { LuEye, LuSunrise, LuSunset } from "react-icons/lu";
import { MdAir } from "react-icons/md";

export interface WeatherDetailsProps {
  visibility: number;
  humidity: number;
  windSpeed: number;
  airPressure: number;
  sunrise: string;
  sunset: string;
}

export default function WeatherDetails(props: WeatherDetailsProps) {
  const {
    visibility = 0,
    humidity = 0,
    windSpeed = 0,
    airPressure = 0,
    sunrise = "0:0",
    sunset = "0:0",
  } = props;

  return (
    <>
      <SingleWeatherDetail
        icon={<LuEye />}
        information="Visibility"
        value={`${visibility} km`}
      />
      <SingleWeatherDetail
        icon={<FiDroplet />}
        information="Humidity"
        value={`${humidity} %`}
      />
      <SingleWeatherDetail
        icon={<MdAir />}
        information="Wind Speed"
        value={`${windSpeed.toFixed(2)} km/h`}
      />
      <SingleWeatherDetail
        icon={<ImMeter />}
        information="Air Pressure"
        value={`${airPressure} hPa`}
      />
      <SingleWeatherDetail
        icon={<LuSunrise />}
        information="Sunrise"
        value={sunrise}
      />
      <SingleWeatherDetail
        icon={<LuSunset />}
        information="Sunset"
        value={sunset}
      />
    </>
  );
}

export interface SingleWeatherDetailProps {
  information: string;
  icon: React.ReactNode;
  value: string;
}

function SingleWeatherDetail(props: SingleWeatherDetailProps) {
  return (
    <div className="flex flex-col justify-between gap-2 items-center text-xs font-semibold">
      <div className="whitespace-nowrap">{props.information}</div>
      <div className="text-3xl">{props.icon}</div>
      <div>{props.value}</div>
    </div>
  );
}
