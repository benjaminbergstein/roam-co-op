import { FC, useRef, useEffect, useState, ReactChild } from "react";
import { format } from "date-fns";
import ReactDOM from "react-dom";

const center = {
  lat: 59.95,
  lng: 30.33,
};
const zoom = 11;

const getGoogle = (prop: string): any => {
  return (window as any).google[prop];
};

const newGoogle = (type: string, ...options: any) => {
  const google = (window as any).google;
  return new google.maps[type](...options);
};

type Coordinate = { lat: number; lng: number };
const createClass = () => {
  class ReactOverlay extends (window as any).google.maps.OverlayView {
    public div: HTMLDivElement;
    private position: Coordinate;

    constructor(position: Coordinate) {
      super();
      this.position = position;
      this.div = document.createElement("div");
      this.div.style.position = "absolute";
      this.div.style.borderStyle = "none";
      this.div.style.borderWidth = "0px";
      this.div.style.zIndex = "9999999";
    }

    onAdd() {
      const panes = this.getPanes()!;
      panes.overlayMouseTarget.appendChild(this.div);
    }

    draw() {
      const overlayProjection = this.getProjection();
      const pixel = overlayProjection.fromLatLngToDivPixel(this.position)!;

      if (this.div) {
        this.div.style.left = pixel.x + "px";
        this.div.style.top = pixel.y + "px";
      }
    }

    onRemove() {
      if (this.div) {
        (this.div.parentNode as HTMLElement).removeChild(this.div);
      }
    }
  }

  return ReactOverlay;
};

const MapOverlay: FC<
  React.PropsWithChildren<{
    map: any;
    position: Coordinate;
  }>
> = ({ map, position, children }) => {
  const [overlay, setOverlay] = useState<any>();

  useEffect(() => {
    if (!map) return;
    const Overlay = createClass();
    const overlay = new Overlay(position);
    overlay.setMap(map);
    setOverlay(overlay);
    return () => {
      overlay.setMap(null);
      setOverlay(undefined);
    };
  }, [map, position]);

  if (!overlay) {
    return null;
  }

  const portal = ReactDOM.createPortal(children, overlay.div);
  return portal;
};

export default MapOverlay;
