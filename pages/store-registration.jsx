import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useRouter } from "next/router";
import ALink from "~/components/features/alink";
import { apirequest } from "~/utils/api";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

function StoreRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [errors, setErrors] = useState({});
  const spaceName = Cookies.get("spaceName");

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1 - Store Information
    store_name: "",
    store_location: "",
    store_latitude: "",
    store_longitude: "",
    store_image: null,
    store_cover_image: null,
    tin_number: "",
    tin_certificate: null,
    expire_date: "",
    
    // Step 2 - General Information
    name: "",
    email: "",
    dial_code: "+91",
    phone: "",
    password: "",
    confirmPassword: ""  });

  // Image preview URLs
  const [imagePreviews, setImagePreviews] = useState({
    store_image: null,
    store_cover_image: null,
    tin_certificate: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // Validate file size (max 2MB)
      if (files[0].size > 2 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [name]: "File size must be less than 2MB"
        }));
        toast.error("File size must be less than 2MB");
        return;
      }
      
      // Store file temporarily
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(files[0]);
      setImagePreviews(prev => ({
        ...prev,
        [name]: previewUrl
      }));
      
      // Upload image immediately in background
      try {
        const imageUrl = await uploadImage(files[0]);
        
        // Store the uploaded URL
        setFormData(prev => ({
          ...prev,
          [`${name}_url`]: imageUrl
        }));
      } catch (error) {
        console.error(`Failed to upload ${name}:`, error);
        // Clear the file on error
        setFormData(prev => ({
          ...prev,
          [name]: null
        }));
        setImagePreviews(prev => ({
          ...prev,
          [name]: null
        }));
        toast.error(`Failed to upload ${name.replace(/_/g, ' ')}`);
      }
      
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ""
        }));
      }
    }
  };

  // Upload image to server
  const uploadImage = async (file) => {
    if (!file) return "";
    
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await apirequest("POST", "/user/upload-image", formData);
      
      if (response && response.success) {
        return response.imageUrl;
      } else {
        const errorMsg = response?.message || "Image upload failed";
        console.error("Upload failed:", errorMsg, response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.store_name.trim()) {
      newErrors.store_name = "Store name is required";
    }
    
    if (!formData.store_location.trim()) {
      newErrors.store_location = "Store location is required";
    }
    
    if (!formData.tin_number.trim()) {
      newErrors.tin_number = "TIN number is required";
    } else if (!/^\d{10}$/.test(formData.tin_number)) {
      newErrors.tin_number = "TIN number must be 10 digits";
    }
    
    if (!formData.expire_date) {
      newErrors.expire_date = "Expiry date is required";
    }
    
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, number and special character";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    return newErrors;
  };

  const handleNextStep = () => {
    const validationErrors = validateStep1();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateStep2();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setUploadProgress("Submitting registration...");

    try {
      // Use already uploaded image URLs
      const payload = {
        name: formData.name,
        email: formData.email,
        dial_code: formData.dial_code,
        phone: formData.phone,
        password: formData.password,
        store_name: formData.store_name,
        store_image: formData.store_image_url || "",
        store_cover_image: formData.store_cover_image_url || "",
        store_latitude: formData.store_latitude || "0",
        store_longitude: formData.store_longitude || "0",
        store_location: formData.store_location,
        tin_number: formData.tin_number,
        tin_certificate: formData.tin_certificate_url || "",
        expire_date: formData.expire_date
      };

      const response = await apirequest("POST", "/users/vendor-register", payload);

      if (response.success) {
        toast.success("Registration successful! Please wait for admin approval.");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        toast.error(response.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="main">
      <Helmet>
        <title>{`Become a Seller | ${spaceName}` || "Become a Seller"}</title>
      </Helmet>

      <div className="page-header text-center" style={{ backgroundColor: "#f4f4f4", padding: "2rem 0" }}>
        <div className="container-fluid">
          <h1 className="page-title">Join as Vendor</h1>
        </div>
      </div>

      <nav className="breadcrumb-nav">
        <div className="container-fluid">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <ALink href="/">Home</ALink>
            </li>
            <li className="breadcrumb-item active">Store Registration</li>
          </ol>
        </div>
      </nav>

      <div className="page-content pb-3">
        <div className="container-fluid">
          <div className="vendor-registration-wrapper">
            {/* Loading Overlay */}
            {loading && (
              <div className="upload-overlay">
                <div className="upload-spinner">
                  <div className="spinner-border text-success" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="upload-message">{uploadProgress}</p>
                </div>
              </div>
            )}
            
            {/* Progress Steps */}
            <div className="registration-steps">
              <div className={`step ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}>
                <div className="step-number">
                  {currentStep > 1 ? <i className="icon-check"></i> : "1"}
                </div>
                <div className="step-label">Store Information</div>
              </div>
              <div className="step-line"></div>
              <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
                <div className="step-number">2</div>
                <div className="step-label">General Information</div>
              </div>
            </div>

            {/* Step 1: Store Information */}
            {currentStep === 1 && (
              <div className="registration-form-container">
                <h2 className="form-section-title">
                  <i className="icon-store"></i> Store Information
                </h2>
                
                <form className="vendor-form">
                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label htmlFor="store_name">Store Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.store_name ? "is-invalid" : ""}`}
                        id="store_name"
                        name="store_name"
                        value={formData.store_name}
                        onChange={handleInputChange}
                        placeholder="Enter your store name"
                      />
                      {errors.store_name && <div className="invalid-feedback">{errors.store_name}</div>}
                    </div>
                    
                    <div className="form-group col-md-6">
                      <label htmlFor="store_location">Store Location *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.store_location ? "is-invalid" : ""}`}
                        id="store_location"
                        name="store_location"
                        value={formData.store_location}
                        onChange={handleInputChange}
                        placeholder="Enter store address"
                      />
                      {errors.store_location && <div className="invalid-feedback">{errors.store_location}</div>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label htmlFor="store_latitude">Store Latitude (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="store_latitude"
                        name="store_latitude"
                        value={formData.store_latitude}
                        onChange={handleInputChange}
                        placeholder="e.g., 40.7128"
                      />
                    </div>
                    
                    <div className="form-group col-md-6">
                      <label htmlFor="store_longitude">Store Longitude (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="store_longitude"
                        name="store_longitude"
                        value={formData.store_longitude}
                        onChange={handleInputChange}
                        placeholder="e.g., 74.0060"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label htmlFor="store_image">Upload Store Logo</label>
                      <div className="custom-file-upload">
                        <input
                          type="file"
                          className="form-control-file"
                          id="store_image"
                          name="store_image"
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                        <label htmlFor="store_image" className="file-label">
                          <i className="icon-upload"></i>
                          {formData.store_image ? formData.store_image.name : "Click to Upload"}
                        </label>
                        {formData.store_image_url && (
                          <div className="upload-success">
                            <i className="icon-check-circle"></i> Uploaded successfully
                          </div>
                        )}
                        {imagePreviews.store_image && (
                          <div className="image-preview">
                            <img src={imagePreviews.store_image} alt="Store logo preview" />
                          </div>
                        )}
                        <small className="form-text text-muted">Max size: 2 MB</small>
                      </div>
                    </div>
                    
                    <div className="form-group col-md-6">
                      <label htmlFor="store_cover_image">Upload Store Cover Image</label>
                      <div className="custom-file-upload">
                        <input
                          type="file"
                          className="form-control-file"
                          id="store_cover_image"
                          name="store_cover_image"
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                        <label htmlFor="store_cover_image" className="file-label">
                          <i className="icon-upload"></i>
                          {formData.store_cover_image ? formData.store_cover_image.name : "Click to Upload"}
                        </label>
                        {imagePreviews.store_cover_image && (
                          <div className="image-preview">
                            <img src={imagePreviews.store_cover_image} alt="Store cover preview" />
                          </div>
                        )}
                        <small className="form-text text-muted">Max size: 2 MB</small>
                      </div>
                    </div>
                  </div>

                  <h3 className="form-subsection-title">
                    <i className="icon-briefcase"></i> Business TIN
                  </h3>

                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label htmlFor="tin_number">TIN Number *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.tin_number ? "is-invalid" : ""}`}
                        id="tin_number"
                        name="tin_number"
                        value={formData.tin_number}
                        onChange={handleInputChange}
                        placeholder="Enter 10-digit TIN number"
                        maxLength="10"
                      />
                      {errors.tin_number && <div className="invalid-feedback">{errors.tin_number}</div>}
                    </div>
                    
                    <div className="form-group col-md-6">
                      <label htmlFor="expire_date">Expiry Date *</label>
                      <input
                        type="date"
                        className={`form-control ${errors.expire_date ? "is-invalid" : ""}`}
                        id="expire_date"
                        name="expire_date"
                        value={formData.expire_date}
                        onChange={handleInputChange}
                      />
                      {errors.expire_date && <div className="invalid-feedback">{errors.expire_date}</div>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-12">
                      <label htmlFor="tin_certificate">TIN Certificate (PDF, DOC, IMAGE)</label>
                      <div className="custom-file-upload">
                        <input
                          type="file"
                          className="form-control-file"
                          id="tin_certificate"
                          name="tin_certificate"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,image/*"
                        />
                        <label htmlFor="tin_certificate" className="file-label">
                          <i className="icon-upload"></i>
                          {formData.tin_certificate ? formData.tin_certificate.name : "Click to Upload"}
                        </label>
                        <small className="form-text text-muted">Max size: 2 MB</small>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => router.push("/")}>
                      Cancel
                    </button>
                    <button type="button" className="btn btn-success" onClick={handleNextStep}>
                      Next Step <i className="icon-long-arrow-right"></i>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: General Information */}
            {currentStep === 2 && (
              <div className="registration-form-container">
                <h2 className="form-section-title">
                  <i className="icon-user"></i> Owner Information
                </h2>
                
                <form className="vendor-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group col-md-12">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>
                  </div>

                  <h3 className="form-subsection-title">
                    <i className="icon-lock"></i> Login Info
                  </h3>

                  <div className="form-row">
                    <div className="form-group col-md-12">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-4">
                      <label htmlFor="dial_code">Country Code *</label>
                      <select
                        className="form-control"
                        id="dial_code"
                        name="dial_code"
                        value={formData.dial_code}
                        onChange={handleInputChange}
                      >
                        <option value="+91">+91 (India)</option>
                        <option value="+1">+1 (USA)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+61">+61 (Australia)</option>
                      </select>
                    </div>
                    
                    <div className="form-group col-md-8">
                      <label htmlFor="phone">Phone Number *</label>
                      <input
                        type="tel"
                        className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter 10-digit phone number"
                        maxLength="10"
                      />
                      {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label htmlFor="password">Password *</label>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password"
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                      <div className="form-text text-muted">
                        At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
                      </div>
                    </div>
                    
                    <div className="form-group col-md-6">
                      <label htmlFor="confirmPassword">Confirm Password *</label>
                      <input
                        type="password"
                        className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Re-enter password"
                      />
                      {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-outline-secondary" onClick={handlePreviousStep}>
                      <i className="icon-long-arrow-left"></i> Previous
                    </button>
                    <button type="submit" className="btn btn-success" disabled={loading}>
                      {loading ? (uploadProgress || "Submitting...") : "Submit Registration"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreRegistration;
