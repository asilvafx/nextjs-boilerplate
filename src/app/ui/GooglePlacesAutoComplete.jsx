import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const GooglePlacesAutoComplete = ({
                                      value,
                                      onChange,
                                      onError,
                                      hasError,
                                      placeholder = "Start typing your address...",
                                      styles = {},
                                      apiKey
                                  }) => {
    const containerRef = useRef(null);
    const placeAutocompleteRef = useRef(null);
    const isLoadedRef = useRef(false);

    // Default styles that can be overridden
    const defaultStyles = {
        width: '100%',
        height: '2.75rem',
        padding: '0.75rem',
        border: '1px solid var(--border)',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        backgroundColor: 'transparent',
        color: 'var(--text-primary)',
        ...styles // Override defaults with provided styles
    };

    const initGooglePlaces = async () => {
        try {
            // Request the places library
            await window.google.maps.importLibrary("places");

            // Create the new PlaceAutocompleteElement
            const placeAutocomplete = new window.google.maps.places.PlaceAutocompleteElement({
                includedRegionCodes: ['fr'],
            });

            // Store reference for cleanup
            placeAutocompleteRef.current = placeAutocomplete;

            // Apply styles to the element
            Object.assign(placeAutocomplete.style, {
                ...defaultStyles,
                borderColor: hasError ? '#ef4444' : (defaultStyles.borderColor || 'var(--border)')
            });

            // Append the new element safely
            if (containerRef.current) {
                containerRef.current.innerHTML = ''; // Clear existing
                containerRef.current.appendChild(placeAutocomplete);
            }

            // Set initial value if provided
            if (value) {
                placeAutocomplete.value = value;
            }

            // Add the place selection listener
            placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
                try {
                    const place = placePrediction.toPlace();
                    await place.fetchFields({ fields: ['formattedAddress'] });

                    const placeData = place.toJSON();
                    const formattedAddress = placeData.formattedAddress;

                    if (formattedAddress) {
                        // Update the visual value in the Google element
                        placeAutocomplete.value = formattedAddress;

                        // Call the onChange callback to update parent state
                        if (onChange) {
                            onChange(formattedAddress);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching place details:', error);
                    if (onError) {
                        onError('Error fetching place details');
                    }
                }
            });

            // Handle focus and blur events for styling
            placeAutocomplete.addEventListener('focus', () => {
                placeAutocomplete.style.borderColor = 'var(--border-focus)';
                placeAutocomplete.style.outline = 'none';
            });

            placeAutocomplete.addEventListener('blur', () => {
                placeAutocomplete.style.borderColor = hasError ? '#ef4444' : (defaultStyles.borderColor || 'var(--border)');
            });

            // Handle manual input changes (when user types directly)
            placeAutocomplete.addEventListener('input', (e) => {
                const inputValue = e.target.value;
                if (onChange) {
                    onChange(inputValue);
                }
            });

        } catch (error) {
            console.error('Error initializing Google Places:', error);
            createFallbackInput();
        }
    };

    const createFallbackInput = () => {
        // Create fallback input
        const fallbackInput = document.createElement('input');
        fallbackInput.type = 'text';
        fallbackInput.placeholder = placeholder;
        fallbackInput.value = value || '';

        Object.assign(fallbackInput.style, {
            ...defaultStyles,
            borderColor: hasError ? '#ef4444' : (defaultStyles.borderColor || 'var(--border)')
        });

        fallbackInput.addEventListener('input', (e) => {
            if (onChange) {
                onChange(e.target.value);
            }
        });

        fallbackInput.addEventListener('focus', () => {
            fallbackInput.style.borderColor = 'var(--border-focus)';
        });

        fallbackInput.addEventListener('blur', () => {
            fallbackInput.style.borderColor = hasError ? '#ef4444' : (defaultStyles.borderColor || 'var(--border)');
        });

        if (containerRef.current) {
            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(fallbackInput);
        }
    };

    const loadGoogleMaps = () => {
        // Validate apiKey
        if (!apiKey) {
            console.warn('Google Maps API key not provided, using fallback input');
            createFallbackInput();
            if (onError) {
                onError('Google Maps API key not provided');
            }
            return;
        }

        // Skip if already loaded
        if (isLoadedRef.current) {
            initGooglePlaces();
            return;
        }

        const loader = new Loader({
            apiKey: apiKey,
            version: 'weekly',
            libraries: ['places'],
        });

        loader.load()
            .then(() => {
                isLoadedRef.current = true;
                initGooglePlaces();
            })
            .catch(err => {
                console.warn('Failed to load Google Maps:', err);
                createFallbackInput();
                if (onError) {
                    onError('Failed to load Google Maps');
                }
            });
    };

    useEffect(() => {
        loadGoogleMaps();

        return () => {
            if (placeAutocompleteRef.current) {
                try {
                    placeAutocompleteRef.current.remove();
                } catch (err) {
                    console.warn('Cleanup error:', err);
                }
            }
        };
    }, []); // Run once on mount

    // Update error styling when hasError prop changes
    useEffect(() => {
        if (placeAutocompleteRef.current) {
            placeAutocompleteRef.current.style.borderColor = hasError ? '#ef4444' : (defaultStyles.borderColor || 'var(--border)');
        }
    }, [hasError, defaultStyles.borderColor]);

    return <div ref={containerRef} className="google-places-input-container" />;
};

export default GooglePlacesAutoComplete;
