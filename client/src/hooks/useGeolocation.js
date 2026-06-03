import { useState, useCallback, useEffect } from 'react';

export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt'); // 'granted' | 'denied' | 'prompt'

  const checkPermission = useCallback(async () => {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionState(result.state);
        
        // Listen for changes
        result.onchange = () => {
          setPermissionState(result.state);
          if (result.state === 'granted') {
            getCurrentPosition();
          } else if (result.state === 'denied') {
            setPosition(null);
            setError('Geolocation permission denied');
          }
        };
        return result.state;
      } catch (e) {
        console.error('Error querying location permission:', e);
      }
    }
    return 'prompt';
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setPermissionState('granted');
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        // If they denied, update permissionState
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState('denied');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, []);

  // Fetch position and check permissions on mount
  useEffect(() => {
    checkPermission().then((state) => {
      if (state === 'granted') {
        getCurrentPosition();
      }
    });
  }, [getCurrentPosition, checkPermission]);

  return { position, error, loading, permissionState, getCurrentPosition, checkPermission };
}

export default useGeolocation;

