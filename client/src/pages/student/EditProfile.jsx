import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FiCamera, FiUpload, FiAlertCircle, FiLoader } from "react-icons/fi";
import { useUpdatedUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";

const EditProfile = ({ user, onClose, refetch }) => {
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "", // Usually email is not editable, but keeping it if backend allows
    profilephoto: null,
  });

  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(user?.photoUrl || "https://github.com/shadcn.png");
  const [isDragging, setIsDragging] = useState(false);

  const [updatedUser, { isLoading }] = useUpdatedUserMutation();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, WEBP)");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setFormData(prev => ({ ...prev, profilephoto: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    data.append("name", formData.name);
    if (formData.profilephoto) {
      data.append("profilephoto", formData.profilephoto);
    }

    try {
      await updatedUser(data).unwrap();
      toast.success("Profile updated successfully");
      if (refetch) await refetch();
      if (onClose) onClose();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Avatar Upload */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 group-hover:border-indigo-500 transition-colors">
            <img 
              src={avatarPreview} 
              alt="Profile Preview" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <FiCamera className="w-8 h-8 text-white" />
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          className="hidden" 
          accept="image/*"
        />
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Click to change avatar
        </p>
      </div>

      {/* Name Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Full Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all`}
          placeholder="Enter your name"
        />
        {errors.name && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <FiAlertCircle /> {errors.name}
          </p>
        )}
      </div>

      {/* Email Input (Read Only) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Email Address
        </label>
        <input
          type="email"
          value={formData.email}
          disabled
          className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
        />
        <p className="text-xs text-slate-400">Email cannot be changed</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && <FiLoader className="animate-spin" />}
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EditProfile;
