import { useState } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import PhoneInput from 'react-phone-input-2';
import GooglePlacesAutoComplete from '@/app/ui/GooglePlacesAutoComplete';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-phone-input-2/lib/style.css';

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

    const serviceOptions = [
        { value: '30‑min intro — Free', label: '30‑min intro — Free' },
        { value: '60‑min Deep Reading — €45', label: '60‑min Deep Reading — €45' },
        { value: '90‑min Coaching + Tarot — €75', label: '90‑min Coaching + Tarot — €75' },
        { value: 'Recorded Audio Read — €30', label: 'Recorded Audio Read — €30' }
    ];

    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'transparent',
            borderColor: state.isFocused ? 'var(--border-focus)' : 'var(--border)',
            borderRadius: '0.5rem',
            padding: '0.05rem',
            margin: 'auto',
            height: '45px',
            fontSize: '0.9rem',
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

    const handleAddressChange = (address) => {
        setFormData((prev) => ({
            ...prev,
            address: address
        }));
        // Clear address error when user inputs address
        if (errors.address) {
            setErrors(prev => ({ ...prev, address: '' }));
        }
    };

    const handleAddressError = (error) => {
        console.warn('Address input error:', error);
        // You can set a specific error state here if needed
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
                'Phone': '+'+formData.phone,
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
                    <div className={`google-places-container ${errors.address ? 'error' : ''}`}>
                        <GooglePlacesAutoComplete
                            value={formData.address}
                            onChange={handleAddressChange}
                            onError={handleAddressError}
                            hasError={!!errors.address}
                            placeholder="Start typing your address..."
                            styles={{ width: '100%' }}
                            apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
                        />
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
                        components={{ IndicatorSeparator:() => null }}
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
