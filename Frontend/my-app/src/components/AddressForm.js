import React, { useState } from 'react';

const AddressForm = ({ onSubmit, onCancel, isLoading }) => {
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    landmark: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!address.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!address.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^\d{10}$/.test(address.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (!address.street.trim()) newErrors.street = 'Street address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.state.trim()) newErrors.state = 'State is required';
    if (!address.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    if (!/^\d{6}$/.test(address.zipCode)) newErrors.zipCode = 'Zip code must be 6 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(address);
    }
  };

  return (
    <div className="address-form-overlay">
      <div className="address-form-card">
        <div className="address-form-header">
          <h2>Delivery Address</h2>
          <p>Please provide your delivery address details</p>
        </div>

        <form onSubmit={handleSubmit} className="address-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={address.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={address.phone}
                onChange={handleChange}
                placeholder="10 digit mobile number"
                disabled={isLoading}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="street">Street Address *</label>
            <input
              type="text"
              id="street"
              name="street"
              value={address.street}
              onChange={handleChange}
              placeholder="House no., Building name, Road name"
              disabled={isLoading}
            />
            {errors.street && <span className="error-message">{errors.street}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={address.city}
                onChange={handleChange}
                placeholder="Enter city"
                disabled={isLoading}
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="state">State *</label>
              <input
                type="text"
                id="state"
                name="state"
                value={address.state}
                onChange={handleChange}
                placeholder="Enter state"
                disabled={isLoading}
              />
              {errors.state && <span className="error-message">{errors.state}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="zipCode">Zip Code *</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={address.zipCode}
                onChange={handleChange}
                placeholder="6 digit postal code"
                disabled={isLoading}
              />
              {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="landmark">Landmark (Optional)</label>
              <input
                type="text"
                id="landmark"
                name="landmark"
                value={address.landmark}
                onChange={handleChange}
                placeholder="Near shops, park, etc."
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;
