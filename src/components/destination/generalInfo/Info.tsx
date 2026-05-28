// import React from 'react';
// import { MapPin } from "lucide-react"
// type InfoProps = {
//   countryData: {
//     region: string;
//     capital: string[];
//     population: number;
//     area: number;
//     idd: {
//       root: string;
//       suffixes: string[];
//     };
//     tld: string[];
//     car: {
//       side: string;
//     };
//   };
//   countryCommonName: string;
// };

// function Info({ countryData, countryCommonName }: InfoProps) {
//   return (
//     <div className="card">
//       <div className="card-header">
//         <MapPin className="icon" />
//         <h2 className="card-title">Basic Info</h2>
//       </div>
//       <div className="card-content">
//         <div className="info-details">
//           {countryData?.region && (
//             <div className="info-item">
//             <span className="info-label">Continent:</span>
//             <p className="info-value">{countryData.region}</p>
//             </div>
//           )}
          
//           <div className="info-item">
//             <span className="info-label">Country:</span>
//             <p className="info-value">{countryCommonName}</p>
//           </div>
//           {countryData?.capital && (
//             <div className="info-item">
//             <span className="info-label">Capital:</span>
//             <p className="info-value">{countryData.capital?.join(', ')}</p>
//           </div>
//           )}
//           {countryData?.population && (
//            <div className="info-item">
//             <span className="info-label">Population:</span>
//             <p className="info-value">{countryData.population.toLocaleString()}</p>
//           </div>
//           )}
//           {countryData?.area && (
//            <div className="info-item">
//             <span className="info-label">Area:</span>
//             <p className="info-value">{countryData.area.toLocaleString()} km²</p>
//           </div>
//           )}
//           {countryData?.idd && (
//             <div className="info-item">
//             <span className="info-label">Country Code:</span>
//             <p className="info-value">{countryData.idd.root}{countryData.idd.suffixes?.join(', ')}</p>
//           </div>
//           )}
//           {countryData?.tld && (
//             <div className="info-item">
//             <span className="info-label">Domain:</span>
//             <p className="info-value">{countryData.tld?.join(', ')}</p>
//           </div>
//           )}
//          {countryData && (
//             <div className="info-item">
//             <span className="info-label">Driving Side:</span>
//             <p className="info-value">{countryData.car?.side}</p>
//           </div>
//           )}
         
          
          
//         </div>
//       </div>

//     </div>
//   );
// }

// export default Info;








'use client';

import React, { useState } from 'react';
import { MapPin } from "lucide-react";

type InfoProps = {
  countryData: {
    region: string;
    capital: string[];
    population: number;
    area: number;
    idd: {
      root: string;
      suffixes: string[];
    };
    tld: string[];
    car: {
      side: string;
    };
    flags?: {
      png?: string;
    };
  };
  countryCommonName: string;

  cityName: string;
  cityInfo?: {
    title: string;
    description: string;
    image?: string;
  } | null;
};

function Info({
  countryData,
  countryCommonName,
  cityName,
  cityInfo
}: InfoProps) {

  // ✅ NEW STATE
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card">

      {/* HEADER */}
      <div className="card-header">
        <MapPin className="icon" />
        <h2 className="card-title">About {cityName}</h2>
      </div>

      <div className="card-content">

        {/* ✅ CITY SECTION */}
        {cityInfo && (
          <div className="mb-6">

            {cityInfo.image && (
              <img
                src={cityInfo.image}
                alt={cityInfo.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}

            {/* ✅ TEXT WITH CLAMP */}
            <p className={`text-gray-700 text-sm content-text ${expanded ? 'expanded' : ''}`}>
              {cityInfo.description}
            </p>

            {/* ✅ READ MORE BUTTON */}
            {cityInfo.description && cityInfo.description.length > 150 && (
              <button
                className="read-more-btn"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* ✅ COUNTRY INFO */}
        <div className="info-details">

          {countryData?.region && (
            <div className="info-item">
              <span className="info-label">Continent:</span>
              <p className="info-value">{countryData.region}</p>
            </div>
          )}

          <div className="info-item">
            <span className="info-label">Country:</span>
            <div className="flex items-center gap-2">
              <img
                 src={countryData.flags?.png}
                 alt="flag"
                 className="w-10 h-6 object-cover rounded"
              />
              <p className="info-value">{countryCommonName}</p>
            </div>
          </div>

          {countryData?.capital && (
            <div className="info-item">
              <span className="info-label">Capital:</span>
              <p className="info-value">
                {countryData.capital.join(', ')}
              </p>
            </div>
          )}

          {countryData?.population && (
            <div className="info-item">
              <span className="info-label">Population:</span>
              <p className="info-value">
                {countryData.population.toLocaleString()}
              </p>
            </div>
          )}

          {countryData?.area && (
            <div className="info-item">
              <span className="info-label">Area:</span>
              <p className="info-value">
                {countryData.area.toLocaleString()} km²
              </p>
            </div>
          )}

          {countryData?.idd && (
            <div className="info-item">
              <span className="info-label">Country Code:</span>
              <p className="info-value">
                {countryData.idd.root}
                {countryData.idd.suffixes?.join(', ')}
              </p>
            </div>
          )}

          {countryData?.tld && (
            <div className="info-item">
              <span className="info-label">Domain:</span>
              <p className="info-value">
                {countryData.tld.join(', ')}
              </p>
            </div>
          )}

          {countryData?.car && (
            <div className="info-item">
              <span className="info-label">Driving Side:</span>
              <p className="info-value">
                {countryData.car.side}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Info;