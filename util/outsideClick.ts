import { useEffect, useRef } from "react";


const useClickOutside = (handler: any) => {
    let domNode = useRef<any>(null);

    useEffect(() => {
        let maybeHandler = (event: any) => {
            // Check if ref is attached before accessing it
            if (domNode.current && !domNode.current.contains(event.target)) {
                handler();
            }
        };

        document.addEventListener("mousedown", maybeHandler);

        return () => {
            document.removeEventListener("mousedown", maybeHandler);
        };
    });

    return domNode;
};

export default useClickOutside;