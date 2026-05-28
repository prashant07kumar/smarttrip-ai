// 'use client';

// import 'leaflet/dist/leaflet.css';
// import { useEffect, useState, useRef } from 'react';
// import dynamic from 'next/dynamic';
// import { getCoordinates } from '@/services/geocode';
// import { MapBounds } from '@/components/map/MapBounds';
// import { ItineraryItem } from '@/types/itineraryItem';
// import L from 'leaflet';
// import { MapPin, Download } from 'lucide-react';
// import Spinner from '@/components/ui/Spinner/Spinner';
// import type { LatLngTuple } from 'leaflet';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas-pro';
// import { toast } from 'react-toastify';
// import Button from '@/components/ui/Button/Button';

// const MapContainer = dynamic(
//   () => import('react-leaflet').then((m) => m.MapContainer),
//   { ssr: false }
// );

// const TileLayer = dynamic(
//   () => import('react-leaflet').then((m) => m.TileLayer),
//   { ssr: false }
// );

// const Marker = dynamic(
//   () => import('react-leaflet').then((m) => m.Marker),
//   { ssr: false }
// );

// const Popup = dynamic(
//   () => import('react-leaflet').then((m) => m.Popup),
//   { ssr: false }
// );

// // Default map center (India)
// const defaultPosition: LatLngTuple = [28.6139, 77.2090];

// type Place = ItineraryItem & {
//   lat?: number;
//   lng?: number;
// };

// const extractCityAndCountry = (place: string): string => {
//   const parts = place.split(',').map((p) => p.trim());

//   if (parts.length >= 2) {
//     const city = parts[parts.length - 2];
//     const country = parts[parts.length - 1];
//     return `${city}, ${country}`;
//   }

//   return place;
// };

// export default function MapaConItinerario({
//   itinerary,
// }: {
//   itinerary: Place[];
// }) {
//   const [itineraryWithCoords, setItineraryWithCoords] = useState<Place[]>([]);
//   const [mapPlaces, setMapPlaces] = useState<Place[]>([]);
//   const [loading, setLoading] = useState(true);

//   const printRef = useRef<HTMLDivElement>(null);

//   const customIcon = (day: number) =>
//     L.divIcon({
//       className:
//         'text-white bg-blue-600 rounded-full w-7 h-7 flex items-center justify-center text-xs shadow-lg',
//       html: `<div>${day}</div>`,
//     });

//   useEffect(() => {
//     const fetchCoords = async () => {
//       setLoading(true);

//       const enriched = await Promise.all(
//         itinerary.map(async (item) => {
//           try {
//             const coords = await getCoordinates(item.place);

//             if (coords) {
//               return {
//                 ...item,
//                 lat: coords.lat,
//                 lng: coords.lng,
//               };
//             }

//             return item;
//           } catch (error) {
//             console.error('Geocode failed:', item.place, error);
//             return item;
//           }
//         })
//       );

//       // Show ALL itinerary text
//       setItineraryWithCoords(enriched);

//       // Only map-valid places
//       setMapPlaces(
//         enriched.filter(
//           (item) =>
//             typeof item.lat === 'number' &&
//             typeof item.lng === 'number'
//         )
//       );

//       setLoading(false);
//     };

//     fetchCoords();
//   }, [itinerary]);

//   const handleDownloadPDF = async () => {
//     if (!printRef.current || !itinerary.length) return;

//     const pdfTitle = `Your itinerary to ${extractCityAndCountry(
//       itinerary[0]?.place ?? ''
//     )}`;

//     try {
//       const mapContainer =
//         printRef.current.querySelector('.mapaConItinerario');

//       if (mapContainer) {
//         mapContainer.classList.add('hide-map');
//       }

//       const canvas = await html2canvas(printRef.current, {
//         scale: 2,
//       });

//       if (mapContainer) {
//         mapContainer.classList.remove('hide-map');
//       }

//       const imgData = canvas.toDataURL('image/png');

//       const pdf = new jsPDF({
//         orientation: 'portrait',
//         unit: 'pt',
//         format: 'a4',
//       });

//       const pdfWidth = pdf.internal.pageSize.getWidth();

//       const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

//       pdf.setFontSize(18);

//       const textWidth = pdf.getTextWidth(pdfTitle);

//       const x = (pdfWidth - textWidth) / 2;

//       pdf.text(pdfTitle, x, 30);

//       pdf.addImage(imgData, 'PNG', 0, 50, pdfWidth, pdfHeight);

//       pdf.save('TripTailor_itinerary.pdf');
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       toast.error('Failed to generate PDF');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="grid items-center justify-center h-screen">
//         <Spinner />
//       </div>
//     );
//   }

//   return (
//     <div
//       ref={printRef}
//       className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4"
//     >
//       {/* MAP SECTION */}

//       <div className="sm:h-[600px] h-[350px] w-full mapaConItinerario order-last sm:order-first">
//         <MapContainer
//           center={defaultPosition}
//           zoom={5}
//           scrollWheelZoom={true}
//           style={{ height: '100%', width: '100%' }}
//           className="rounded-xl shadow-lg"
//         >
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution="&copy; OpenStreetMap contributors"
//           />

//           {mapPlaces.map((item, idx) => (
//             <Marker
//               key={idx}
//               position={[item.lat!, item.lng!]}
//               icon={customIcon(item.day)}
//             >
//               <Popup>
//                 <strong>Day {item.day}</strong>
//                 <br />
//                 {item.title}
//                 <br />
//                 {item.description}
//               </Popup>
//             </Marker>
//           ))}

//           <MapBounds
//             coordinates={mapPlaces.map((p) => [p.lat!, p.lng!])}
//           />
//         </MapContainer>
//       </div>

//       {/* ITINERARY SECTION */}

//       <div className="space-y-8 overflow-y-auto max-h-[600px] pr-2">

//         {Array.from(
//           new Set(itineraryWithCoords.map((item) => item.day))
//         ).map((day) => {

//           const dayItems = itineraryWithCoords.filter(
//             (item) => item.day === day
//           );

//           return (
//             <div
//               key={day}
//               className="bg-gray-50 rounded-xl p-5 shadow-sm border"
//             >
//               <h2 className="text-2xl font-bold text-blue-700 mb-5">
//                 Day {day}
//               </h2>

//               <div className="space-y-5">

//                 {dayItems.map((item, idx) => (
//                   <div
//                     key={idx}
//                     className="border-l-4 border-blue-500 pl-4"
//                   >
//                     <h3 className="font-semibold text-lg text-gray-800">
//                       {item.title}
//                     </h3>

//                     <p className="text-gray-600 mt-2">
//                       {item.description}
//                     </p>

//                     <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
//                       <MapPin size={14} />
//                       {item.place}
//                     </p>
//                   </div>
//                 ))}

//               </div>
//             </div>
//           );
//         })}

//         {/* DOWNLOAD BUTTON */}

//         <div className="text-right mt-4">
//           <Button
//             onClick={handleDownloadPDF}
//             variant="secondary"
//             size="sm"
//             icon={<Download className="inline" />}
//           >
//             Download PDF
//           </Button>
//         </div>

//       </div>
//     </div>
//   );
// }




'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { getCoordinates } from '@/services/geocode';
import { MapBounds } from '@/components/map/MapBounds';
import { ItineraryItem } from '@/types/itineraryItem';
import L from 'leaflet';
import { MapPin, Download } from 'lucide-react';
import Spinner from '@/components/ui/Spinner/Spinner';
import type { LatLngTuple } from 'leaflet';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button/Button';

const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
);

// fallback (only used if no coords found)
const defaultPosition: LatLngTuple = [28.6139, 77.2090];

type Place = ItineraryItem & {
  lat?: number;
  lng?: number;
};

const extractCityAndCountry = (place: string): string => {
  const parts = place.split(',').map((p) => p.trim());
  if (parts.length >= 2) {
    return `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
  }
  return place;
};

export default function MapaConItinerario({
  itinerary,
}: {
  itinerary: Place[];
}) {
  const [itineraryWithCoords, setItineraryWithCoords] = useState<Place[]>([]);
  const [mapPlaces, setMapPlaces] = useState<Place[]>([]);
  const [mapCenter, setMapCenter] = useState<LatLngTuple>(defaultPosition);
  const [mapZoom, setMapZoom] = useState(5);
  const [loading, setLoading] = useState(true);

  const printRef = useRef<HTMLDivElement>(null);

  const customIcon = (day: number) =>
    L.divIcon({
      className:
        'text-white bg-blue-600 rounded-full w-7 h-7 flex items-center justify-center text-xs shadow-lg',
      html: `<div>${day}</div>`,
    });

  useEffect(() => {
    const fetchCoords = async () => {
      setLoading(true);

      const enriched = await Promise.all(
        itinerary.map(async (item) => {
          try {
            const coords = await getCoordinates(item.place);

            if (coords) {
              return {
                ...item,
                lat: coords.lat,
                lng: coords.lng,
              };
            }

            return item;
          } catch (error) {
            console.error('Geocode failed:', item.place, error);
            return item;
          }
        })
      );

      const validPlaces = enriched.filter(
        (item) =>
          typeof item.lat === 'number' &&
          typeof item.lng === 'number'
      );

      setItineraryWithCoords(enriched);
      setMapPlaces(validPlaces);

      // 🔥 AUTO CENTER + ZOOM FIX
      if (validPlaces.length > 0) {
        setMapCenter([validPlaces[0].lat!, validPlaces[0].lng!]);
        setMapZoom(12); // zoom into city
      } else {
        setMapCenter(defaultPosition);
        setMapZoom(5);
      }

      setLoading(false);
    };

    fetchCoords();
  }, [itinerary]);

  const handleDownloadPDF = async () => {
    if (!printRef.current || !itinerary.length) return;

    const pdfTitle = `Your itinerary to ${extractCityAndCountry(
      itinerary[0]?.place ?? ''
    )}`;

    try {
      const canvas = await html2canvas(printRef.current, { scale: 2 });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.setFontSize(18);

      const textWidth = pdf.getTextWidth(pdfTitle);
      const x = (pdfWidth - textWidth) / 2;

      pdf.text(pdfTitle, x, 30);
      pdf.addImage(imgData, 'PNG', 0, 50, pdfWidth, pdfHeight);

      pdf.save('TripTailor_itinerary.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) {
    return (
      <div className="grid items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      ref={printRef}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4"
    >
      {/* MAP */}
      <div className="sm:h-[600px] h-[350px] w-full">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="rounded-xl shadow-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {mapPlaces.map((item, idx) => (
            <Marker
              key={idx}
              position={[item.lat!, item.lng!]}
              icon={customIcon(item.day)}
            >
              <Popup>
                <strong>Day {item.day}</strong>
                <br />
                {item.title}
                <br />
                {item.description}
              </Popup>
            </Marker>
          ))}

          <MapBounds
            coordinates={mapPlaces.map((p) => [p.lat!, p.lng!])}
          />
        </MapContainer>
      </div>

      {/* ITINERARY */}
      <div className="space-y-8 overflow-y-auto max-h-[600px] pr-2">
        {Array.from(
          new Set(itineraryWithCoords.map((item) => item.day))
        ).map((day) => {
          const dayItems = itineraryWithCoords.filter(
            (item) => item.day === day
          );

          return (
            <div
              key={day}
              className="bg-gray-50 rounded-xl p-5 shadow-sm border"
            >
              <h2 className="text-2xl font-bold text-blue-700 mb-5">
                Day {day}
              </h2>

              {dayItems.map((item, idx) => (
                <div
                  key={idx}
                  className="border-l-4 border-blue-500 pl-4 mb-4"
                >
                  <h3 className="font-semibold text-lg">
                    {item.title}
                  </h3>

                  <p className="text-gray-600 mt-1">
                    {item.description}
                  </p>

                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <MapPin size={14} />
                    {item.place}
                  </p>
                </div>
              ))}
            </div>
          );
        })}

        <div className="text-right mt-4">
          <Button
            onClick={handleDownloadPDF}
            variant="secondary"
            size="sm"
            icon={<Download className="inline" />}
          >
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}