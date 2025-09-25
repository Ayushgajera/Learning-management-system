import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCamera, FiUpload, FiAlertCircle } from "react-icons/fi";
import { useUpdatedUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";

const EditProfile = ({ userProfile, onSave, onCancel }) => {
  const fileInputRef = useRef(null);
  const userData = useSelector((state) => state.auth.user);

  // Initialize form data with user data
  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    profilephoto: null,
  });

  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(userProfile?.photoUrl || "/placeholder.jpg");
  const [isDragging, setIsDragging] = useState(false);

  const [updatedUser, { data: updateUserdata, isLoading }] = useUpdatedUserMutation();

  // Add effect to sync form data with userData changes
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        name: userData.name || "",
        email: userData.email || "",
      }));
    }
  }, [userData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image (JPEG, PNG)");
        return;
      }

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
      setFormData(prev => ({ ...prev, profilephoto: file }));

    } catch (error) {
      console.error('Image upload error:', error);
      toast.error("Failed to process image");
      setAvatarPreview(userProfile?.photoUrl || "/placeholder.jpg");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleImageUpload(fakeEvent);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("email", formData.email.trim());
      if (formData.profilephoto) {
        payload.append("profilephoto", formData.profilephoto);
      }

      const result = await updatedUser(payload).unwrap();
      if (result.success) {
        toast.success("Profile updated successfully!");
        onSave(result.user);
      }
    } catch (err) {
      toast.error(err.data?.message || "Failed to update profile");
      console.error("Profile update error:", err);
    }
  };

  // Add cleanup effect for image preview URLs
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Update form inputs to use formData instead of userData
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isLoading}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Avatar Upload */}
            <div
              className={`flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-xl
                ${isDragging ? 'border-purple-600 bg-purple-50' : 'border-gray-300'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="relative group">
                <img
                  src={avatarPreview}
                  alt={userData.name || "avatar"}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 group-hover:border-purple-200 transition-all"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiCamera className="w-8 h-8 text-white" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors inline-flex items-center gap-2"
                >
                  <FiUpload className="w-4 h-4" />
                  Upload New Photo
                </button>
                <p className="mt-2 text-sm text-gray-500">
                  Drag and drop or click to upload
                </p>
                <p className="text-xs text-gray-400">
                  Maximum file size: 5MB (JPG, PNG)
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) {
                      setErrors({ ...errors, name: "" });
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 
                    focus:border-transparent transition-colors
                    ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) {
                      setErrors({ ...errors, email: "" });
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 
                    focus:border-transparent transition-colors
                    ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-6 py-2 text-gray-700 border rounded-lg hover:bg-gray-50 
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditProfile;
