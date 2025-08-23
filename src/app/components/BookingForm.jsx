import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import PhoneInput from 'react-phone-input-2';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-phone-input-2/lib/style.css';

// Global variable to track if Google Maps is being loaded
let isGoogleMapsLoading = false;
let googleMapsLoadPromise = null;

const BookingForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        service: { value: '30‑min intro — Free', label: '30‑min intro — Free' },
        when: null,
        topic: ''
    });

    const [errors, setErrors] = useState({});
    const addressContainerRef = useRef(null);
    const placeAutocompleteRef = useRef(null);

    const serviceOptions = [
        { value: '30‑min intro — Free', label: '30‑min intro — Free' },
        { value: '60‑min Deep Reading — €45', label: '60‑min Deep Reading — €45' },
        { value: '90‑min Coaching + Tarot — €75', label: '90‑min Coaching + Tarot — €75' },
        { value: 'Recorded Audio Read — €30', label: 'Recorded Audio Read — €30' }
    ];

    async function initMap(){
        // Request the places library
        await window.google.maps.importLibrary("places");

        // Create the new PlaceAutocompleteElement
        const placeAutocomplete = new window.google.maps.places.PlaceAutocompleteElement({
            includedRegionCodes: ['fr'],
        });

        // Store reference for cleanup
        placeAutocompleteRef.current = placeAutocomplete;

        // Style the element to match your form
        placeAutocomplete.style.width = '100%';
        placeAutocomplete.style.height = '2.75rem';
        placeAutocomplete.style.padding = '0.75rem';
        placeAutocomplete.style.border = '1px solid var(--border)';
        placeAutocomplete.style.borderRadius = '0.5rem';
        placeAutocomplete.style.fontSize = '0.875rem';
        placeAutocomplete.style.backgroundColor = 'transparent';
        placeAutocomplete.style.color = 'var(--text-primary)';

        // Append the new element safely
        if (addressContainerRef.current) {
            addressContainerRef.current.innerHTML = ''; // 👈 clear existing
            addressContainerRef.current.appendChild(placeAutocomplete);
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

                    // Update React state
                    setFormData(prev => ({
                        ...prev,
                        address: formattedAddress
                    }));

                    // Clear address error if exists
                    setErrors(prev => ({ ...prev, address: '' }));
                }
            } catch (error) {
                console.error('Error fetching place details:', error);
            }
        });

        // Handle focus and blur events for styling
        placeAutocomplete.addEventListener('focus', () => {
            placeAutocomplete.style.borderColor = 'var(--border-focus)';
            placeAutocomplete.style.outline = 'none';
        });

        placeAutocomplete.addEventListener('blur', () => {
            placeAutocomplete.style.borderColor = 'var(--border)';
        });

        // Apply error styling if needed
        if (errors.address) {
            placeAutocomplete.style.borderColor = '#ef4444';
        }
    }

    const loadGoogleMapsScript = () => {
        // If already loaded, return resolved promise
        if (window.google && window.google.maps) {
            return Promise.resolve();
        }

        // If already loading, return existing promise
        if (isGoogleMapsLoading && googleMapsLoadPromise) {
            return googleMapsLoadPromise;
        }

        // Check if script already exists in DOM
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            return new Promise((resolve) => {
                if (window.google && window.google.maps) {
                    resolve();
                } else {
                    existingScript.onload = () => resolve();
                }
            });
        }

        // Create new script
        isGoogleMapsLoading = true;
        googleMapsLoadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                isGoogleMapsLoading = false;
                resolve();
            };

            script.onerror = () => {
                isGoogleMapsLoading = false;
                reject(new Error('Failed to load Google Maps script'));
            };

            document.head.appendChild(script);
        });

        return googleMapsLoadPromise;
    };

    // Initialize Google Places Autocomplete with the new PlaceAutocompleteElement
    useEffect(() => {
        const initializePlaceAutocomplete = async () => {
            if (!addressContainerRef.current) return;

            try {
                await loadGoogleMapsScript();
                await initMap();

            } catch (error) {
                console.error('Failed to initialize Google Places Autocomplete:', error);

                // Fallback to regular text input if autocomplete fails
                const fallbackInput = document.createElement('input');
                fallbackInput.type = 'text';
                fallbackInput.placeholder = 'Start typing your address...';
                fallbackInput.value = formData.address;
                fallbackInput.style.width = '100%';
                fallbackInput.style.height = '2.75rem';
                fallbackInput.style.padding = '0.75rem';
                fallbackInput.style.border = '1px solid var(--border)';
                fallbackInput.style.borderRadius = '0.5rem';
                fallbackInput.style.fontSize = '0.875rem';
                fallbackInput.style.backgroundColor = 'transparent';
                fallbackInput.style.color = 'var(--text-primary)';

                fallbackInput.addEventListener('input', (e) => {
                    setFormData(prev => ({
                        ...prev,
                        address: e.target.value
                    }));
                    if (errors.address) {
                        setErrors(prev => ({ ...prev, address: '' }));
                    }
                });

                if (addressContainerRef.current) {
                    addressContainerRef.current.innerHTML = '';
                    addressContainerRef.current.appendChild(fallbackInput);
                }
            }
        };

        initializePlaceAutocomplete();

        return () => {
            // Cleanup
            if (placeAutocompleteRef.current) {
                try {
                    placeAutocompleteRef.current.remove();
                } catch (error) {
                    // Ignore cleanup errors
                    console.warn('Error during place autocomplete cleanup:', error);
                }
            }
        };
    }, []);

    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'transparent',
            borderColor: state.isFocused ? 'var(--border-focus)' : 'var(--border)',
            borderRadius: '0.5rem',
            padding: '0.25rem',
            fontSize: '0.875rem',
            boxShadow: 'none',
            '&:hover': {
                borderColor: 'var(--border-focus)'
            }
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            zIndex: 9999
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isHovered ? 'var(--surface)' : 'transparent',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            '&:active': {
                backgroundColor: 'var(--surface-hover)'
            }
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'var(--text-primary)'
        }),
        placeholder: (provided) => ({
            ...provided,
            color: 'var(--text-secondary)'
        }),
        input: (provided) => ({
            ...provided,
            color: 'var(--text-primary)'
        })
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleServiceChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            service: selectedOption
        }));
        if (errors.service) {
            setErrors(prev => ({ ...prev, service: '' }));
        }
    };

    const handleDateChange = (date) => {
        setFormData((prev) => ({
            ...prev,
            when: date
        }));
        if (errors.when) {
            setErrors(prev => ({ ...prev, when: '' }));
        }
    };

    const handlePhoneChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            phone: value
        }));
        if (errors.phone) {
            setErrors(prev => ({ ...prev, phone: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        if (!formData.service) {
            newErrors.service = 'Please select a service';
        }

        if (!formData.when) {
            newErrors.when = 'Please select a preferred date/time';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBookingSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            // Format the data for display
            const displayData = {
                'First Name': formData.firstName,
                'Last Name': formData.lastName,
                'Email': formData.email,
                'Phone': formData.phone,
                'Address': formData.address,
                'Service': formData.service.value,
                'Preferred Date/Time': formData.when ? formData.when.toLocaleString() : 'Not selected',
                'Topic': formData.topic || 'No topic specified'
            };

            // Create formatted string for alert
            const formattedData = Object.entries(displayData)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');

            alert(`Form submitted successfully!\n\n${formattedData}`);

            // You can also log the raw data for debugging
            console.log('Form Data:', formData);
        }
    };

    return (
        <div className="card sticky">
            <div className="booking-header">
                <h3>Book a reading</h3>
                <p>Fast booking via email — instant confirmations</p>
            </div>

            <form id="booking" className="booking-form" onSubmit={handleBookingSubmit}>
                <div className="form-row">
                    <div className="form-field">
                        <label>First name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Alex"
                            className={errors.firstName ? 'error' : ''}
                        />
                        {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                    </div>
                    <div className="form-field">
                        <label>Last name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Smith"
                            className={errors.lastName ? 'error' : ''}
                        />
                        {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                    </div>
                </div>

                <div className="form-field">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-field">
                    <label>Phone number</label>
                    <PhoneInput
                        country={'fr'}
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        inputClass={errors.phone ? 'error' : ''}
                        containerClass="phone-input-container"
                        buttonClass="phone-input-button"
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                <div className="form-field">
                    <label>Address</label>
                    <div
                        ref={addressContainerRef}
                        className={`google-places-container ${errors.address ? 'error' : ''}`}
                    >
                        {/* PlaceAutocompleteElement will be inserted here */}
                    </div>
                    {errors.address && <span className="error-text">{errors.address}</span>}
                </div>

                <div className="form-field">
                    <label>Service</label>
                    <Select
                        value={formData.service}
                        onChange={handleServiceChange}
                        options={serviceOptions}
                        styles={customSelectStyles}
                        placeholder="Select a service..."
                        isSearchable={false}
                        className={errors.service ? 'react-select-error' : ''}
                    />
                    {errors.service && <span className="error-text">{errors.service}</span>}
                </div>

                <div className="form-field">
                    <label>Preferred date / time</label>
                    <DatePicker
                        selected={formData.when}
                        onChange={handleDateChange}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        minDate={new Date()}
                        placeholderText="Select date and time..."
                        className={`datepicker-input ${errors.when ? 'error' : ''}`}
                    />
                    {errors.when && <span className="error-text">{errors.when}</span>}
                </div>

                <div className="form-field">
                    <label>Short question / topic (optional)</label>
                    <textarea
                        name="topic"
                        value={formData.topic}
                        onChange={handleInputChange}
                        placeholder="One sentence about what you'd like help with"
                    />
                </div>

                <button type="submit" className="primary full-width">
                    Send booking request
                </button>
            </form>

            <p className="small">
                Or email directly:{' '}
                <a href="mailto:readings@starlittarot.example" className="underline-link">
                    readings@starlittarot.example
                </a>
            </p>
            <p className="small">
                Payment via PayPal / Wise after confirmation. Sessions held on Zoom or phone.
            </p>
        </div>
    );
};

export default BookingForm;
