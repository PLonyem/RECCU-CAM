"use client";

import { useCallback, useEffect, useRef } from "react";
import L, { type LayerGroup, type Map as LeafletMap, type Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { getRegionById } from "@/data/affiliates/regions";
import type { MappableAffiliate } from "@/data/affiliates/helpers";

const CAMEROON_VIEW: L.LatLngExpression = [7.37, 12.35];

function locationLabel(affiliate: MappableAffiliate) {
  return [affiliate.city, getRegionById(affiliate.region)?.name]
    .filter(Boolean)
    .join(", ");
}

function directionsHref(affiliate: MappableAffiliate) {
  return `https://www.google.com/maps/dir/?api=1&destination=${affiliate.latitude},${affiliate.longitude}`;
}

function popupContent(affiliate: MappableAffiliate) {
  const container = document.createElement("div");
  container.className = "min-w-56 py-1";

  if (affiliate.acronym) {
    const acronym = document.createElement("p");
    acronym.className = "text-[0.7rem] font-bold uppercase tracking-[0.12em] text-forest";
    acronym.textContent = affiliate.acronym;
    container.append(acronym);
  }

  const title = document.createElement("h3");
  title.className = "mt-1 font-display text-base font-bold leading-snug text-institutional";
  title.textContent = affiliate.name;
  container.append(title);

  const location = locationLabel(affiliate);
  if (location) {
    const locationText = document.createElement("p");
    locationText.className = "mt-2 text-sm text-muted-foreground";
    locationText.textContent = location;
    container.append(locationText);
  }

  if (affiliate.shortDescription) {
    const description = document.createElement("p");
    description.className = "mt-2 text-sm leading-relaxed text-muted-foreground";
    description.textContent = affiliate.shortDescription;
    container.append(description);
  }

  const actions = document.createElement("div");
  actions.className = "mt-4 flex flex-wrap gap-3";

  const profile = document.createElement("a");
  profile.href = `/network/affiliates/${encodeURIComponent(affiliate.slug)}`;
  profile.className = "font-semibold text-forest underline decoration-accent-400 underline-offset-4";
  profile.textContent = "View Profile";
  actions.append(profile);

  const directions = document.createElement("a");
  directions.href = directionsHref(affiliate);
  directions.target = "_blank";
  directions.rel = "noreferrer";
  directions.className = "font-semibold text-forest underline decoration-accent-400 underline-offset-4";
  directions.textContent = "Directions";
  actions.append(directions);

  container.append(actions);
  return container;
}

interface InteractiveNetworkMapProps {
  affiliates: readonly MappableAffiliate[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

export default function InteractiveNetworkMap({
  affiliates,
  onSelect,
  selectedSlug,
}: InteractiveNetworkMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, Marker>());

  const setMapContainer = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      mapRef.current?.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      markersRef.current.clear();
      return;
    }

    if (mapRef.current) return;

    const map = L.map(node, {
      center: CAMEROON_VIEW,
      zoom: 6,
      minZoom: 5,
      maxZoom: 18,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    markerLayerRef.current = L.layerGroup().addTo(map);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markersRef.current.clear();

    const bounds: L.LatLngExpression[] = [];
    for (const affiliate of affiliates) {
      const position: L.LatLngExpression = [affiliate.latitude, affiliate.longitude];
      const marker = L.marker(position, {
        alt: affiliate.name,
        keyboard: true,
        riseOnHover: true,
        title: affiliate.name,
        icon: L.divIcon({
          className: "reccucam-map-marker",
          html: "",
          iconAnchor: [18, 38],
          iconSize: [36, 40],
          popupAnchor: [0, -36],
        }),
      });

      marker.bindPopup(popupContent(affiliate), { maxWidth: 320 });
      marker.on("click", () => onSelect(affiliate.slug));
      marker.addTo(layer);
      markersRef.current.set(affiliate.slug, marker);
      bounds.push(position);
    }

    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { maxZoom: 13, padding: [48, 48] });
    } else {
      map.setView(CAMEROON_VIEW, 6);
    }
  }, [affiliates, onSelect]);

  useEffect(() => {
    if (!selectedSlug) return;
    const marker = markersRef.current.get(selectedSlug);
    if (!marker) return;
    marker.openPopup();
    mapRef.current?.panTo(marker.getLatLng());
  }, [selectedSlug]);

  return (
    <div
      ref={setMapContainer}
      role="region"
      aria-label="Interactive map of affiliates with verified coordinates"
      className="h-[32rem] w-full bg-muted lg:h-[45rem]"
    />
  );
}
