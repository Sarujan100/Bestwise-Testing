"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { FiMail, FiPhone, FiMapPin, FiShoppingBag, FiLogOut, FiEdit2, FiUser, FiEye, FiEyeOff, FiClock } from "react-icons/fi";
import Navbar from "@/app/components/navbar/page";
import axios from "axios";
import { toast, Toaster } from 'sonner';
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { updateUserProfile } from "../../slices/userSlice";
import { IoCloseCircleOutline } from "react-icons/io5";

export default function ProfilePage() {
  const { user } = useSelector(state => state.userState);
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reminder state
  const [reminders, setReminders] = useState([]);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [editReminder, setEditReminder] = useState(null);
  const [editFields, setEditFields] = useState({ remindermsg: '', date: '', time: '', event: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setTimeout(() => setIsLoading(false), 800);
      fetchReminders();
    }
  }, [user, router]);

  const fetchReminders = async () => {
    setReminderLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reminder`, { withCredentials: true });
      setReminders(res.data.reminders || []);
    } catch (err) {
      toast.error('Failed to fetch reminders');
    } finally {
      setReminderLoading(false);
    }
  };

  const openEditModal = (reminder) => {
    setEditReminder(reminder);
    setEditFields({
      remindermsg: reminder.remindermsg,
      date: reminder.date ? reminder.date.slice(0, 10) : '',
      time: reminder.time || '',
      event: reminder.event || '',
    });
  };
  const closeEditModal = () => {
    setEditReminder(null);
    setEditFields({ remindermsg: '', date: '', time: '', event: '' });
    setIsAddMode(false);
  };
  const handleEditChange = (e) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };
  const handleEditSave = async () => {
    if (!editFields.remindermsg || !editFields.date || !editFields.time || !editFields.event) {
      toast.error('Please fill all fields');
      return;
    }
    setEditSaving(true);
    try {
      if (isAddMode) {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/reminder`, editFields, { withCredentials: true });
        toast.success('Reminder created!');
      } else {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reminder/${editReminder._id}`, editFields, { withCredentials: true });
        toast.success('Reminder updated!');
      }
      closeEditModal();
      fetchReminders();
    } catch (err) {
      toast.error('Failed to update reminder');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    setDeleteLoadingId(reminderId);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/reminder/${reminderId}`, { withCredentials: true });
      toast.success('Reminder deleted!');
      fetchReminders();
    } catch (err) {
      toast.error('Failed to delete reminder');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/updateprofile`,
            { phone, address },
            { withCredentials: true }
      );
      dispatch(updateUserProfile(res.data.user));
      toast.success("Profile updated successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const openAddModal = () => {
    setIsAddMode(true);
    setEditReminder({});
    setEditFields({ remindermsg: '', date: '', time: '', event: '' });
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-gray-50 to-blue-50">
        <main className="max-w-5xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Account</h1>
            <p className="text-base text-gray-500 mt-1">Manage your personal information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column - Profile Card */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-md border p-8 flex flex-col items-center sticky top-28" style={{ borderColor: 'rgba(217,217,217,0.5)' }}>
                <div className="relative mb-4">
                  <span className="block w-36 h-36 rounded-full bg-gradient-to-tr from-purple-200 to-blue-200 p-1 shadow-lg">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                    />
                  </span>
                  <button
                    className="absolute bottom-2 right-2 bg-white p-2 rounded-full border border-gray-200 shadow hover:bg-gray-50 transition-colors"
                    title="Change photo"
                  >
                    <FiEdit2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">{user.firstName} {user.lastName}</h2>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <FiMail className="w-4 h-4 mr-2" />
                  <span>{user.email}</span>
                </div>
                {user.role && (
                  <span className="mt-2 inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                    {user.role}
                  </span>
                )}
                <div className="w-full mt-8 pt-6 border-t border-gray-100 space-y-3">
                  <button
                    onClick={() => router.push("/orders")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
                  >
                    <FiShoppingBag className="w-5 h-5" />
                    <span>View Orders</span>
                  </button>
                  <button
                    onClick={() => {/* Add logout handler */}}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium shadow-sm"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* Right Column - Information */}
            <section className="lg:col-span-2 space-y-10">
              {/* Personal Information */}
              <div className="bg-white rounded-md border" style={{ borderColor: 'rgba(217,217,217,0.5)' }}>
                <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-purple-100 to-blue-100">
                    <FaUser className="w-5 h-5 text-purple-600" />
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Personal Information</h3>
                </div>
                <form className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiPhone className="w-4 h-4 text-gray-400" />
                        </span>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Add phone number"
                          className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition text-gray-900 bg-gray-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMapPin className="w-4 h-4 text-gray-400" />
                        </span>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Add address"
                          className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition text-gray-900 bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="px-8 py-3 bg-purple-600 text-white text-base font-semibold rounded-lg shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Password Change Section */}
              <div className="bg-white rounded-md border" style={{ borderColor: 'rgba(217,217,217,0.5)' }}>
                <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-pink-100 to-yellow-100">
                    <RiLockPasswordFill  className="w-5 h-5 text-pink-600" />
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Change Password</h3>
                </div>
                <div className="p-8">
                  <PasswordChangeForm />
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-md border" style={{ borderColor: 'rgba(217,217,217,0.5)' }}>
                <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-green-100 to-blue-100">
                    <FiShoppingBag className="w-5 h-5 text-green-600" />
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Order Summary</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-tr from-purple-50 to-blue-50 rounded-xl p-6 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <FiShoppingBag className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{user.orders?.length || 0}</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-tr from-yellow-50 to-pink-50 rounded-xl p-6 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-pink-100 rounded-full">
                      <FiUser className="w-7 h-7 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Order</p>
                      <p className="text-xl font-semibold text-gray-900 mt-1">{user.orders?.[0]?.date || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reminder History */}
              <div className="bg-white rounded-md border" style={{ borderColor: 'rgba(217,217,217,0.5)' }}>
                <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-100 to-purple-100">
                    <FiClock className="w-5 h-5 text-yellow-600" />
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Reminder History</h3>
                </div>
                <div className="p-8">
                  {reminderLoading ? (
                    <div>Loading reminders...</div>
                  ) : reminders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="bg-purple-50 rounded-full p-4 mb-4">
                        <FiClock className="w-10 h-10 text-purple-400" />
                      </div>
                      <div className="text-lg font-semibold text-gray-700 mb-1">No Reminders Yet</div>
                      <div className="text-gray-400 text-sm mb-4">You haven't set any reminders. Start by adding a new one!</div>
                      <button
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow"
                        onClick={openAddModal}
                      >
                        Set Reminder
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {reminders.map(reminder => (
                        <li key={reminder._id} className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <div>
                            <div className="font-semibold text-gray-800">{reminder.event}</div>
                            <div className="text-gray-600 text-sm">{reminder.remindermsg}</div>
                            <div className="text-gray-500 text-xs mt-1">{reminder.date ? reminder.date.slice(0,10) : ''} {reminder.time}</div>
                          </div>
                          <div className="flex gap-2 mt-2 md:mt-0">
                            <button
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                              onClick={() => openEditModal(reminder)}
                            >
                              Edit
                            </button>
                            <button
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors"
                              onClick={() => handleDeleteReminder(reminder._id)}
                              disabled={deleteLoadingId === reminder._id}
                            >
                              {deleteLoadingId === reminder._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Edit Reminder Modal */}
              {(editReminder || isAddMode) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <div className="bg-white rounded-md p-8 w-full max-w-md relative" style={{ border: '1px solid rgba(217,217,217,0.5)' }}>
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={closeEditModal}>
                      <IoCloseCircleOutline  className="w-6 h-6" />
                    </button>
                    <h3 className="text-lg font-semibold mb-4">{isAddMode ? 'Set Reminder' : 'Edit Reminder'}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                          name="remindermsg"
                          value={editFields.remindermsg}
                          onChange={handleEditChange}
                          className="w-full border border-gray-200 rounded-lg p-2"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          name="date"
                          type="date"
                          value={editFields.date}
                          onChange={handleEditChange}
                          className="w-full border border-gray-200 rounded-lg p-2"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input
                          name="time"
                          type="time"
                          value={editFields.time}
                          onChange={handleEditChange}
                          className="w-full border border-gray-200 rounded-lg p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                        <select
                          name="event"
                          value={editFields.event}
                          onChange={handleEditChange}
                          className="w-full border border-gray-200 rounded-lg p-2"
                        >
                          <option value="">Select Event</option>
                          <option value="Birthday">Birthday</option>
                          <option value="Fathers Day">Father's Day</option>
                          <option value="Mothers Day">Mother's Day</option>
                          <option value="Brothers Day">Brother's Day</option>
                          <option value="Christmas">Christmas</option>
                          <option value="Key Birthday">Key Birthday</option>
                          <option value="New Year">New Year</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                        onClick={closeEditModal}
                        disabled={editSaving}
                      >Cancel</button>
                      <button
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        onClick={handleEditSave}
                        disabled={editSaving}
                      >{editSaving ? (isAddMode ? 'Creating...' : 'Saving...') : (isAddMode ? 'Create' : 'Save')}</button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
        <Toaster position="top-center" richColors closeButton />
      </div>
    </>
  );
}

// Password Change Form Component
function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password strength meter
  function getStrength(password) {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }
  const strength = getStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/changepassword`,
        { oldPassword: currentPassword, password: newPassword },
        { withCredentials: true }
      );
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update password.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition text-gray-900 bg-gray-50 pr-12"
            placeholder="Enter current password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500"
            tabIndex={-1}
            onClick={() => setShowCurrent(v => !v)}
            aria-label={showCurrent ? "Hide password" : "Show password"}
          >
            {showCurrent ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition text-gray-900 bg-gray-50 pr-12"
            placeholder="Enter new password"
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500"
            tabIndex={-1}
            onClick={() => setShowNew(v => !v)}
            aria-label={showNew ? "Hide password" : "Show password"}
          >
            {showNew ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        {/* Password strength meter */}
        <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              strength === 0 ? "w-0" :
              strength === 1 ? "w-1/4 bg-red-400" :
              strength === 2 ? "w-2/4 bg-yellow-400" :
              strength === 3 ? "w-3/4 bg-blue-400" :
              "w-full bg-green-500"
            }`}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {strength === 0 && "Too weak"}
          {strength === 1 && "Weak"}
          {strength === 2 && "Medium"}
          {strength === 3 && "Strong"}
          {strength === 4 && "Very strong"}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition text-gray-900 bg-gray-50 pr-12"
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500"
            tabIndex={-1}
            onClick={() => setShowConfirm(v => !v)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>
      {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 bg-[#822BE2] text-white text-base font-semibold rounded-lg shadow hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </div>
    </form>
  );
}
