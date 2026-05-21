// 'use client';
// import 'leaflet/dist/leaflet.css';
// import { useEffect, useState, useRef } from 'react';
// import dynamic from 'next/dynamic';
// import { getCoordinates } from '@/services/geocode'; 
// import { MapBounds }  from '@/components/map/MapBounds';
// import { ItineraryItem } from '@/types/itineraryItem';
// import L from 'leaflet';
// import { MapPin, Download} from 'lucide-react';
// import Spinner from '@/components/ui/Spinner/Spinner';
// import type { LatLngTuple } from 'leaflet';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas-pro';
// import { toast } from 'react-toastify';
// import Button from '@/components/ui/Button/Button';

// const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
// const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
// const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
// const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

// // const defaultPosition: LatLngTuple = [48.8566, 2.3522]; // París map
// const defaultPosition: LatLngTuple = [28.6139, 77.2090]; // Delhi

// const extractCityAndCountry = (place: string): string => {
//   const parts = place.split(',').map(p => p.trim());
//   if (parts.length >= 2) {
//     const city = parts[parts.length - 2];
//     const country = parts[parts.length - 1];
//     return `${city}, ${country}`;
//   }
//   return place; 
// };
// type Place = ItineraryItem;

// export default function MapaConItinerario({ itinerary }: { itinerary: Place[] }) {
//   const [itineraryWithCoords, setItineraryWithCoords] = useState<Place[]>([]); // little change
//   const [loading, setLoading] = useState(true); 
//   const printRef = useRef<HTMLDivElement>(null);

//   const customIcon = (day: number) =>
//     L.divIcon({
//       className: 'text-white bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow',
//       html: `<div>${day}</div>`,
//     });

//   useEffect(() => {
//     const fetchCoords = async () => {
//       setLoading(true);
//       const enriched = await Promise.all(
//         itinerary.map(async (item) => {
//           const coords = await getCoordinates(item.place);
//           return coords
//             ? { ...item, lat: coords.lat, lng: coords.lng }
//             : item;
//         })
//       );
//       setItineraryWithCoords(enriched.filter((item) => item.lat && item.lng)); /// ye
//       setLoading(false);
//     };

//     fetchCoords();
//   }, [itinerary]);

//   if (loading) {
//     return <div className='grid items-center justify-center h-screen'><Spinner /></div>;
//   }
//   const handleDownloadPDF = async () => {
//     if (!printRef.current || !itinerary) return;
//     const pdfTitle = `Your itinerary to ${extractCityAndCountry(itinerary[0]?.place ?? '')}`;
//     try {
//       const mapContainer = printRef.current.querySelector('.mapaConItinerario');
//       if (mapContainer) {
//         mapContainer.classList.add('hide-map');
//       }
//       const element = printRef.current;
//       const canvas = await html2canvas(element, { scale: 2 });
//       const imgData = canvas.toDataURL('image/png');
//       if (mapContainer) {
//         mapContainer.classList.remove('hide-map');
//       }

//       const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
 
//     const fontSize = 18;
//     pdf.setFontSize(fontSize);
//     const textWidth = pdf.getTextWidth(pdfTitle);
//     const x = (pdfWidth - textWidth) / 2; 
//     const y = fontSize + 10; 
//     pdf.text(pdfTitle, x, y);

//     const imageY = y + 10; 
//     pdf.addImage(imgData, 'PNG', 0, imageY, pdfWidth, pdfHeight);
//     pdf.save(`TripTailor_itinerary.pdf`);
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       toast.error("Failed to generate PDF");
//     }
//   };
//   if (loading) {
//     return <div className='grid items-center justify-center h-screen'><Spinner /></div>;
//   }
//   return (
//     <div ref={printRef}  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
//       <div className="sm:h-[500px] h-[300px] w-full mapaConItinerario order-last sm:order-first" >
//         <MapContainer
//           center={defaultPosition}
//           zoom={5}
//           scrollWheelZoom={false}
//           style={{ height: '100%', width: '100%' }}
//           className="rounded-lg shadow-lg"
//         >
//           <TileLayer
//             url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
//             attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
//           />
//           {itineraryWithCoords.map((item, idx) => (
//             <Marker key={idx} position={[item.lat!, item.lng!]} icon={customIcon(item.day)}>
//               <Popup>
//                 <strong>Day {item.day}:</strong> {item.title}<br />
//                 {item.description}
//               </Popup>
//             </Marker>
//           ))}
//           <MapBounds coordinates={itineraryWithCoords.map(p => [p.lat!, p.lng!])} />
//         </MapContainer>
//       </div>

//       <div className="space-y-4">
//         {itineraryWithCoords.map((item, idx) => (
       
//           <div key={idx} className="text-grey-800 border-0">
//             {idx === 0 || item.day !== itineraryWithCoords[idx - 1].day ? (
//               <p className="text-xl font-semibold mb-2">Day {item.day}</p>
//             ) : null}
//             <p><strong className="text-gray-800 mb-4 text-sm">{item.title}</strong></p>
//             <p className="text-gray-800 mb-2 text-sm">{item.description}</p>
//             <p className="text-sm text-gray-500 whitespace-nowrap">
//               <MapPin className="inline" size={12} /> {item.place}
//             </p>
            
//           </div>
         
//         ))}
//             <div className='block text-right mt-4'>
//               <Button onClick={handleDownloadPDF} variant="secondary" size = "sm" icon={<Download className='inline'/>}>
//                   Download PDF
//               </Button>
//             </div>
            
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

// Default map center (India)
const defaultPosition: LatLngTuple = [28.6139, 77.2090];

type Place = ItineraryItem & {
  lat?: number;
  lng?: number;
};

const extractCityAndCountry = (place: string): string => {
  const parts = place.split(',').map((p) => p.trim());

  if (parts.length >= 2) {
    const city = parts[parts.length - 2];
    const country = parts[parts.length - 1];
    return `${city}, ${country}`;
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

      // Show ALL itinerary text
      setItineraryWithCoords(enriched);

      // Only map-valid places
      setMapPlaces(
        enriched.filter(
          (item) =>
            typeof item.lat === 'number' &&
            typeof item.lng === 'number'
        )
      );

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
      const mapContainer =
        printRef.current.querySelector('.mapaConItinerario');

      if (mapContainer) {
        mapContainer.classList.add('hide-map');
      }

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
      });

      if (mapContainer) {
        mapContainer.classList.remove('hide-map');
      }

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
      {/* MAP SECTION */}

      <div className="sm:h-[600px] h-[350px] w-full mapaConItinerario order-last sm:order-first">
        <MapContainer
          center={defaultPosition}
          zoom={5}
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

      {/* ITINERARY SECTION */}

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

              <div className="space-y-5">

                {dayItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="border-l-4 border-blue-500 pl-4"
                  >
                    <h3 className="font-semibold text-lg text-gray-800">
                      {item.title}
                    </h3>

                    <p className="text-gray-600 mt-2">
                      {item.description}
                    </p>

                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      <MapPin size={14} />
                      {item.place}
                    </p>
                  </div>
                ))}

              </div>
            </div>
          );
        })}

        {/* DOWNLOAD BUTTON */}

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