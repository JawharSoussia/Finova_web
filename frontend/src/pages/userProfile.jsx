import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
   FaUser,
  FaShieldAlt,
  FaBell,
  FaSave,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaUpload,
  FaLock,
  FaTrash,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCamera,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa';
import { Tab } from '@headlessui/react'; 

const UserProfile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    profilePicture: '',
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    emailNotifications: false,
  });
  const [editing, setEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const authToken = localStorage.getItem('authToken'); // Retrieve authToken from localStorage

  // Fetch user profile from the backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        let data = response.data;
        // Si le backend retourne 'name' mais pas 'firstName'/'lastName', on splitte
        if (data.name && (!data.firstName || !data.lastName)) {
          const [firstName, ...rest] = data.name.split(' ');
          data.firstName = firstName || '';
          data.lastName = rest.join(' ') || '';
        }
        setProfile(prev => ({
          ...prev,
          ...data
        }));
      } catch (error) {
        console.error('Failed to fetch user profile:', error.message);
      }
    };

    if (authToken) {
      fetchUserProfile();
    }
  }, [authToken]);

  // Form validation function
  const validateForm = () => {
    const errors = {};
    if (!profile.firstName.trim()) errors.firstName = 'First name is required';
    if (!profile.lastName.trim()) errors.lastName = 'Last name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) errors.email = 'Invalid email';

    // Validate date of birth
    const today = new Date();
    const dateOfBirth = new Date(profile.dateOfBirth);
    if (!profile.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else if (dateOfBirth >= today) {
      errors.dateOfBirth = 'Date of birth must be in the past';
    } else {
      const age = today.getFullYear() - dateOfBirth.getFullYear();
      const monthDiff = today.getMonth() - dateOfBirth.getMonth();
      const dayDiff = today.getDate() - dateOfBirth.getDate();
      if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
        errors.dateOfBirth = 'You must be at least 18 years old';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    // Contrôle de saisie avant soumission
    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append("firstName", profile.firstName);
    formData.append("lastName", profile.lastName);
    formData.append("email", profile.email);
    formData.append("phoneNumber", profile.phoneNumber);
    formData.append("dateOfBirth", profile.dateOfBirth);

    if (profile.profilePicture instanceof File) {
      formData.append("profilePicture", profile.profilePicture);
    }

    try {
      const response = await axios.put("http://localhost:5000/api/users/profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Always use the backend response!
      setProfile(prev => ({
        ...prev,
        ...response.data,
        profilePicture: response.data.profilePicture // ensure it's a string
      }));
      setEditing(false);
      setSavedSuccessfully(true);

      // Reset success message after 3 seconds
      setTimeout(() => setSavedSuccessfully(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      // Optionally, show an error message to the user
    }
  };

  const toggleSecuritySetting = (setting) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({
        ...prev,
        profilePicture: file, // Store the file object for upload
      }));
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== 'delete') {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      // Clear local storage and redirect to home
      localStorage.removeItem("authToken");
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to delete account:", error);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Error message component for DRY principle
  const ErrorMessage = ({ message }) => (
    <p className="text-red-500 text-sm mt-1 flex items-center">
      <FaTimesCircle className="mr-2" /> {message}
    </p>
  );

  // Form field component for reusability
  const FormField = ({ label, type, value, onChange, error, placeholder }) => (
    <div>
      <label className="block text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
      />
      {error && <ErrorMessage message={error} />}
    </div>
  );

  // Security setting toggle component
  const SecurityToggle = ({ icon, title, description, checked, onChange }) => (
    <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
      <div className="flex items-center">
        {icon}
        <div>
          <span className="font-medium">{title}</span>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
      <label className="switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="slider round"></span>
      </label>
    </div>
  );

  return (
    <div className="p-5">
      <Tab.Group>
        {/* Profile Info Section */}
        <div className="px-5 pt-5 mt-5 intro-y box border border-gray-200 shadow-md">
          <div className="flex flex-col pb-5 -mx-5 border-b lg:flex-row border-slate-200/60">
            {/* Left: Profile Picture and Basic Info */}
            <div className="flex items-center justify-center flex-1 px-5 lg:justify-start">
              <div className="relative flex-none w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32">
                <img
                  alt="Profile"
                  className="rounded-full object-cover w-full h-full"
                  src={
                    profile.profilePicture && typeof profile.profilePicture === 'string'
                      ? (profile.profilePicture.startsWith('http')
                        ? profile.profilePicture
                        : `http://localhost:5000${profile.profilePicture}`)
                      : '/api/placeholder/200/200'
                  }
                />
                <label className="absolute bottom-0 right-0 flex items-center justify-center p-2 mb-1 mr-1 rounded-full bg-blue-500 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                  <FaCamera className="w-4 h-4 text-white" />
                </label>
              </div>
              <div className="ml-5">
                <div className="w-24 text-lg font-medium truncate sm:w-40 sm:whitespace-normal">
                  {profile.firstName} {profile.lastName}
                </div>
                <div className="text-slate-500">{profile.email}</div>
                {profile.dateOfBirth && (
                  <div className="text-slate-500">
                    Born: {new Date(profile.dateOfBirth).toLocaleDateString('en-US')}
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Contact Details */}
            <div className="flex-1 px-5 pt-5 mt-6 border-t border-l border-r lg:mt-0 lg:border-t-0 lg:pt-0">
              <div className="font-medium text-center lg:text-left lg:mt-3">
                Contact Details
              </div>
              <div className="flex flex-col items-center justify-center mt-4 lg:items-start">
                <div className="flex items-center truncate sm:whitespace-normal">
                  <FaEnvelope className="w-4 h-4 mr-2 text-blue-500" />
                  {profile.email}
                </div>
                <div className="flex items-center mt-3 truncate sm:whitespace-normal">
                  <FaPhone className="w-4 h-4 mr-2 text-blue-500" />
                  {profile.phoneNumber || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Tab List */}
          <Tab.List className="flex justify-start border-b border-gray-200">
            <Tab className={({ selected }) => 
            `px-4 py-3 font-medium text-sm sm:text-base focus:outline-none
             ${selected 
               ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' 
               : 'text-gray-600 hover:text-blue-500 hover:border-b-2 hover:border-blue-300'}`
          }>
              Account & Profile
            </Tab>
             <Tab className={({ selected }) => 
            `px-4 py-3 font-medium text-sm sm:text-base focus:outline-none
             ${selected 
               ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' 
               : 'text-gray-600 hover:text-blue-500 hover:border-b-2 hover:border-blue-300'}`
          }>
              Security
            </Tab>
          </Tab.List>
        </div>

        <Tab.Panels className="mt-5">
          <Tab.Panel>
            {/* Profile Section */}
            <div className="intro-y box p-5 border border-gray-200 shadow-md">
              <div className="flex items-center mb-6 relative">
                <div className="flex-1">
                  <h2 className="text-xl font-medium">
                    Personal Information
                  </h2>
                  <p className="text-slate-500">
                    Manage your personal details and profile settings
                  </p>
                </div>

                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                  >
                    <FaEdit className="mr-2" /> Edit
                  </button>
                )}
              </div>

              {savedSuccessfully && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 flex items-center">
                  <FaCheckCircle className="mr-3 text-xl" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              {editing ? (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.firstName ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                      />
                      {validationErrors.firstName && <ErrorMessage message={validationErrors.firstName} />}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.lastName ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                      />
                      {validationErrors.lastName && <ErrorMessage message={validationErrors.lastName} />}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                      />
                      {validationErrors.email && <ErrorMessage message={validationErrors.email} />}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phoneNumber}
                        onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.phoneNumber ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                      />
                      {validationErrors.phoneNumber && <ErrorMessage message={validationErrors.phoneNumber} />}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={profile.dateOfBirth}
                        onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.dateOfBirth ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                      />
                      {validationErrors.dateOfBirth && <ErrorMessage message={validationErrors.dateOfBirth} />}
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 justify-end pt-5 border-t mt-6">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition flex items-center"
                    >
                      <FaSave className="mr-2" /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setValidationErrors({});
                      }}
                      className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-500 mb-1">First Name</label>
                      <div className="font-medium">{profile.firstName}</div>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Last Name</label>
                      <div className="font-medium">{profile.lastName}</div>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Email</label>
                      <div className="font-medium">{profile.email}</div>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Phone Number</label>
                      <div className="font-medium">{profile.phoneNumber || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Date of Birth</label>
                      <div className="font-medium">
                        {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US') : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Tab.Panel>

          <Tab.Panel>
            {/* Security Settings */}
            <div className="intro-y box p-5">
              <h2 className="text-xl font-medium mb-6 flex items-center">
                <FaShieldAlt className="mr-3 text-blue-600" /> Security Settings
              </h2>

              <div className="space-y-6">
                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FaShieldAlt className="mr-4 text-green-600 text-xl" />
                    <div>
                      <span className="font-medium">Two-Factor Authentication</span>
                      <p className="text-gray-600 text-sm">
                        Protect your account with an extra layer of security
                      </p>
                    </div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={securitySettings.twoFactorAuth}
                      onChange={() => toggleSecuritySetting('twoFactorAuth')}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FaBell className="mr-4 text-blue-600 text-xl" />
                    <div>
                      <span className="font-medium">Email Notifications</span>
                      <p className="text-gray-600 text-sm">
                        Receive important updates via email
                      </p>
                    </div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={securitySettings.emailNotifications}
                      onChange={() => toggleSecuritySetting('emailNotifications')}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                {/* Delete Account Section */}
                <div className="mt-8 pt-6 border-t border-red-200">
                  <h3 className="text-xl font-semibold text-red-600 mb-4 flex items-center">
                    <FaExclamationTriangle className="mr-3" /> Danger Zone
                  </h3>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-red-700 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center"
                    >
                      <FaTrash className="mr-2" /> Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
              <FaExclamationTriangle className="mr-3" /> Delete Account
            </h3>
            <p className="text-gray-700 mb-4">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Please type "delete" to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Type 'delete' to confirm"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation.toLowerCase() !== 'delete' || isDeleting}
                className={`px-4 py-2 rounded-lg flex items-center ${deleteConfirmation.toLowerCase() === 'delete' && !isDeleting
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } transition`}
              >
                {isDeleting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="mr-2" /> Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CSS styles */}
       <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }
        
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
        }
        
        input:checked + .slider {
          background-color: #2196F3;
        }
        
        input:checked + .slider:before {
          transform: translateX(26px);
        }
        
        .slider.round {
          border-radius: 34px;
        }
        
        .slider.round:before {
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};
export default UserProfile;