import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth <= breakpoint;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const query = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = (event) => setIsMobile(event.matches);

    update(query);

    if (query.addEventListener) {
      query.addEventListener("change", update);
    } else {
      query.addListener(update);
    }

    return () => {
      if (query.removeEventListener) {
        query.removeEventListener("change", update);
      } else {
        query.removeListener(update);
      }
    };
  }, [breakpoint]);

  return isMobile;
}
