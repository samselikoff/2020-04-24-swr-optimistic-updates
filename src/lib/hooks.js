import { useRef, useEffect, useState } from "react";

export function useIsMountedRef() {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}

export function useRequestManager() {
  let [pendingRequestIds, setPendingRequestIds] = useState([]);

  function create() {
    const requestId = Symbol();
    setPendingRequestIds([...pendingRequestIds, requestId]);

    return {
      done() {
        setPendingRequestIds((pendingRequestIds) =>
          pendingRequestIds.filter((id) => id !== requestId)
        );
      },
    };
  }

  return {
    create,
    hasPendingRequests: pendingRequestIds.length > 0,
  };
}

export function useRefState(initialState) {
  let [state, setState] = useState(initialState);
  let ref = useRef(state);

  function updateRefAndSetState(newState) {
    ref.current = newState;
    setState(newState);
  }

  return [ref, updateRefAndSetState];
}
