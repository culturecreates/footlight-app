import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for Google Places Autocomplete using the new AutocompleteSuggestion API
 * This replaces the deprecated AutocompleteService API
 *
 * @param {Object} options - Configuration options
 * @param {string[]} options.includedRegionCodes - Array of country codes (e.g., ['CA', 'JP'])
 * @param {number} options.debounce - Debounce delay in milliseconds (default: 300)
 * @returns {Object} Hook state and methods
 */
export const usePlacesAutocomplete = ({ includedRegionCodes = [], debounce = 300 } = {}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);

  const regionCodesRef = useRef(includedRegionCodes);

  useEffect(() => {
    regionCodesRef.current = includedRegionCodes;
  }, [includedRegionCodes]);

  const fetchSuggestions = useCallback(async (input) => {
    if (!input || input.trim() === '') {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { AutocompleteSuggestion } = await window.google.maps.importLibrary('places');

      const request = {
        input,
        includedRegionCodes: regionCodesRef.current.length > 0 ? regionCodesRef.current : undefined,
      };

      const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

      const formattedSuggestions = response.suggestions.map((suggestion) => {
        const placePrediction = suggestion.placePrediction;
        return {
          placeId: placePrediction.placeId,
          description: `${placePrediction.mainText.text}, ${placePrediction.secondaryText.text}`,
          mainText: placePrediction.mainText.text,
          secondaryText: placePrediction.secondaryText.text,
          types: placePrediction.types,
          structuredFormatting: {
            main_text: placePrediction.mainText.text,
            secondary_text: placePrediction.secondaryText.text,
          },
          _original: suggestion,
        };
      });

      setSuggestions(formattedSuggestions);
    } catch (err) {
      console.error('Error fetching place suggestions:', err);
      setError(err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) {
        fetchSuggestions(value);
      } else {
        setSuggestions([]);
      }
    }, debounce);

    return () => clearTimeout(timer);
  }, [value, debounce, fetchSuggestions]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    isLoading,
    value,
    setValue,
    error,
    clearSuggestions,
  };
};

/**
 * Get place details by place ID using the new Place API
 *
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} Place details including address components and geometry
 */
export const getPlaceDetails = async (placeId) => {
  try {
    const { Place } = await window.google.maps.importLibrary('places');

    const place = new Place({
      id: placeId,
    });

    await place.fetchFields({
      fields: ['displayName', 'formattedAddress', 'addressComponents', 'location'],
    });

    return place;
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw error;
  }
};

/**
 * Legacy geocodeByAddress replacement using the new Place Autocomplete API
 * This function is provided for compatibility with the old react-places-autocomplete API
 *
 * @param {string} address - Address string or place ID
 * @returns {Promise<Object[]>} Array of geocoded results
 */
export const geocodeByAddress = async (address) => {
  try {
    const isPlaceId = /^(ChI|Eh|Em|Gm)/i.test(address);

    if (isPlaceId) {
      const place = await getPlaceDetails(address);

      return [
        {
          address_components:
            place.addressComponents?.map((component) => ({
              long_name: component.longText,
              short_name: component.shortText,
              types: component.types,
            })) || [],
          formatted_address: place.formattedAddress,
          geometry: {
            location: place.location,
          },
          place_id: place.id,
        },
      ];
    } else {
      const geocoder = new window.google.maps.Geocoder();
      return new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK') {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
    }
  } catch (error) {
    console.error('Error in geocodeByAddress:', error);
    throw error;
  }
};

/**
 * Extract lat/lng from geocoding results
 * This function is provided for compatibility with the old react-places-autocomplete API
 *
 * @param {Object} result - Geocoding result object
 * @returns {Object} Object with lat and lng properties
 */
export const getLatLng = (result) => {
  return {
    lat:
      typeof result.geometry.location.lat === 'function'
        ? result.geometry.location.lat()
        : result.geometry.location.lat,
    lng:
      typeof result.geometry.location.lng === 'function'
        ? result.geometry.location.lng()
        : result.geometry.location.lng,
  };
};
