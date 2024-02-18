"use client";

import { useQuery } from "react-query";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { parseISO, format, fromUnixTime } from "date-fns";
import Container from "@/components/Container";
import { convertKelvinToCelsius } from "@/utils/convertKelvinToCelsius";
import WeatherIcon from "@/components/WeatherIcon";
import WeatherDetails from "@/components/WeatherDetails";
import ForecastWeatherDetails from "@/components/ForecastWeatherDetails";
import { useAtom } from "jotai";
import { loadingCityAtom, placeAtom } from "./atom";
import { useEffect } from "react";

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherItem[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

interface WeatherItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: WeatherCondition[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export default function Home() {
  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity] = useAtom(loadingCityAtom);

  const { isLoading, error, data, refetch } = useQuery<WeatherData>(
    "repoData",
    async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`
      );

      return data;
    }
  );

  useEffect(() => {
    refetch();
  }, [place, refetch]);

  const firstData = data?.list[0];

  console.log(data);

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    ),
  ];

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();

      return entryDate === date && entryTime >= 6;
    });
  });

  if (isLoading)
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce">Loading...</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar location={data?.city.name} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {loadingCity ? (
          <WeatherSkeleton />
        ) : (
          <>
            <section className="space-y-4">
              <div className="space-y-2">
                <h2 className="flex gap-1 text-2xl items-end">
                  <div>{format(parseISO(firstData?.dt_txt ?? ""), "EEEE")}</div>
                  <div className="text-lg">
                    ({format(parseISO(firstData?.dt_txt ?? ""), "dd.MM.yyyy")})
                  </div>
                </h2>
                <Container className="gap-10 px-6 items-center">
                  <div className="flex flex-col px-4">
                    <span className="text-5xl">
                      {convertKelvinToCelsius(firstData?.main.temp ?? 0)}°
                    </span>
                    <div className="text-xs space-x-1 whitespace-nowrap">
                      <span>Feels like</span>
                      <span>
                        {convertKelvinToCelsius(
                          firstData?.main.feels_like ?? 0
                        )}
                        °
                      </span>
                    </div>
                    <div className="text-xs space-x-2">
                      <span>
                        {convertKelvinToCelsius(firstData?.main.temp_min ?? 0)}
                        °↓{" "}
                      </span>
                      <span>
                        {" "}
                        {convertKelvinToCelsius(firstData?.main.temp_max ?? 0)}
                        °↑
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                    {data?.list.map((d, i) => (
                      <div
                        key={i}
                        className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
                      >
                        <div className="whitespace-nowrap">
                          {format(parseISO(d.dt_txt), "h:mm a")}
                        </div>
                        <WeatherIcon iconName={d.weather[0].icon} />
                        <div>{convertKelvinToCelsius(d.main.temp ?? 0)}°</div>
                      </div>
                    ))}
                  </div>
                </Container>
              </div>
              <div className="flex gap-4">
                <Container className="w-fit justify-center flex-col px-4 items-center">
                  <div className="capitalize text-center">
                    {firstData?.weather[0].description}
                  </div>
                  <WeatherIcon iconName={firstData?.weather[0].icon ?? ""} />
                </Container>
                <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
                  <WeatherDetails
                    visibility={(firstData?.visibility ?? 0) / 1000} // meters to kilometers
                    humidity={firstData?.main.humidity ?? 0}
                    windSpeed={(firstData?.wind.speed ?? 0) * 3.6} // meters per second to kilometers per hour
                    airPressure={firstData?.main.pressure ?? 0}
                    sunrise={format(
                      fromUnixTime(data?.city.sunrise ?? 0),
                      "H:mm"
                    )}
                    sunset={format(
                      fromUnixTime(data?.city.sunset ?? 0),
                      "H:mm"
                    )}
                  />
                </Container>
              </div>
            </section>
            <section className="flex w-full flex-col gap-4">
              <div className="text-2xl">Forecast (7 days)</div>
              {firstDataForEachDate.map((d, i) => (
                <ForecastWeatherDetails
                  key={i}
                  description={d?.weather[0].description ?? ""}
                  weatherIcon={d?.weather[0].icon ?? "01d"}
                  date={format(parseISO(d?.dt_txt ?? ""), "dd.MM")}
                  day={format(parseISO(d?.dt_txt ?? ""), "EEEE")}
                  feels_like={d?.main.feels_like ?? 0}
                  temp={d?.main.temp ?? 0}
                  visibility={(firstData?.visibility ?? 0) / 1000} // meters to kilometers
                  humidity={firstData?.main.humidity ?? 0}
                  windSpeed={(firstData?.wind.speed ?? 0) * 3.6} // meters per second to kilometers per hour
                  airPressure={firstData?.main.pressure ?? 0}
                  sunrise={format(
                    fromUnixTime(data?.city.sunrise ?? 0),
                    "H:mm"
                  )}
                  sunset={format(fromUnixTime(data?.city.sunset ?? 0), "H:mm")}
                />
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <section className="space-y-4">
      <div className="space-y-2 animate-pulse">
        <h2 className="flex gap-1 text-2xl items-end">
          <div className="w-24 h-6 bg-gray-300"></div>
          <div className="text-lg w-28 h-6 bg-gray-300"></div>
        </h2>
        <div className="flex gap-10 px-6 items-center">
          <div className="flex flex-col px-4">
            <span className="text-5xl w-16 h-8 bg-gray-300"></span>
            <div className="text-xs space-x-1 whitespace-nowrap">
              <span className="w-20 h-4 bg-gray-300"></span>
              <span className="w-20 h-4 bg-gray-300"></span>
            </div>
            <div className="text-xs space-x-2">
              <span className="w-20 h-4 bg-gray-300"></span>
              <span className="w-20 h-4 bg-gray-300"></span>
            </div>
          </div>
          <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
              >
                <div className="whitespace-nowrap w-16 h-4 bg-gray-300"></div>
                <div className="w-8 h-8 bg-gray-300"></div>
                <div className="w-16 h-4 bg-gray-300"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-fit justify-center flex-col px-4 items-center animate-pulse">
            <div className="capitalize text-center w-24 h-4 bg-gray-300"></div>
            <div className="w-8 h-8 bg-gray-300"></div>
          </div>
          <div className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto animate-pulse">
            <div className="w-20 h-4 bg-gray-300"></div>
            <div className="w-20 h-4 bg-gray-300"></div>
            <div className="w-20 h-4 bg-gray-300"></div>
            <div className="w-20 h-4 bg-gray-300"></div>
            <div className="w-20 h-4 bg-gray-300"></div>
          </div>
        </div>
      </div>
      <section className="flex w-full flex-col gap-4 animate-pulse">
        <div className="text-2xl w-32 h-6 bg-gray-300"></div>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="w-full h-32 bg-gray-300"></div>
        ))}
      </section>
    </section>
  );
}
