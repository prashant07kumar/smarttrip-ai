'use client';
// destination.scss is imported globally in app/layout.tsx
import React, { Suspense } from 'react';
import Header from '@/components/layout/header/Header';
import Footer from '@/components/layout/footer/Footer';
import DestinationHero from '@/components/destination/hero/DestinationHero';
import QuickInfo from '@/components/destination/quickInfo/QuickInfo';
import Info from '@/components/destination/generalInfo/Info';
import Clima from '@/components/destination/clima/Clima';
import CompoMap from '@/components/destination/map/CompoMap';
import Cuisine from '@/components/destination/cuisine/Cuisine';
import Culture from '@/components/destination/culture/Culture';
import TravelTipsModal from '@/components/destination/travelTips/TravelTipsModal';
import TravelAssistantModal from '@/components/travelAssistent/TravelAssistantModal';
import { useDestinationInfo } from '@/hooks/useDestinationInfo';
import Spinner from '@/components/ui/Spinner/Spinner';
import { notFound } from 'next/navigation';

type Props = {
  place: string;
};

const DestinationClient = ({ place }: Props) =>{

  const { data, error, isLoading } = useDestinationInfo(place);

  if (isLoading) return <div className='grid items-center justify-center h-screen'><Spinner /></div>;
  if (error || !data) return notFound();

   

  const {
    coords,
    cityName,
    breadcrumbDisplay,
    countryData,
    countryCommonName,
    timeZone,
    weatherData,
    cuisineData,
    cultureData,
    cityInfo, // ✅ NEW
  } = data;
  if (!countryData || !countryData.languages) {
      return notFound();
    }
  return (
    <>
      <Header />
      <main className="destination-detail">
        <DestinationHero
          countryData={countryData}
          breadcrumbDisplay={breadcrumbDisplay}
          countryCommonName={countryCommonName}
          cityName={cityName}
        />

        <QuickInfo
          weatherData={weatherData}
          countryData={countryData}
          timeZone={timeZone}
        />

        <section className="dashboard-container">
          <div className="container">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="h-full">
                <Suspense fallback={<Spinner />}>
                  <Info
                    countryData={countryData}
                    countryCommonName={countryCommonName}
                    cityName={cityName}
                    cityInfo={cityInfo}
                  />
                </Suspense>
              </div>

              <div className="h-full">
                <Suspense fallback={<Spinner />}>
                  <Clima weatherData={weatherData} />
                </Suspense>
              </div>

              <div className="h-full">
                <Suspense fallback={<Spinner />}>
                  <CompoMap
                    lat={coords.lat}
                    lng={coords.lng}
                    place={coords.displayName}
                  />
                </Suspense>
              </div>
            </div>

            <div className="mt-6">
              <Suspense fallback={<Spinner />}>
                <TravelTipsModal place={cityName} />
              </Suspense>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <Suspense fallback={<Spinner />}>
                <Cuisine cuisineData={cuisineData} />
              </Suspense>
              <Suspense fallback={<Spinner />}>
                <Culture
                  cultureData={cultureData}
                  countryCommonName={countryCommonName}
                />
              </Suspense>
            </div>

            <div className="chatbot-container">
              <TravelAssistantModal destination={cityName} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
export default DestinationClient