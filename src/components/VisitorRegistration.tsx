import React, { useState, useRef } from 'react';
import { Camera, User, Phone, Mail, Building, Users, Clock, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface VisitorRegistrationProps {
  onRegister: (visitor: any) => void;
}

const VisitorRegistration: React.FC<VisitorRegistrationProps> = ({ onRegister }) => {
  const { user } = useAuth();
  
  if (!user) return null;

  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    purpose: '',
    hostEmployeeName: '',
    hostDepartment: '',
    companyName: '',
  });
  
  const [photo, setPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const purposes = [
    'Business Meeting',
    'Interview',
    'Delivery',
    'Maintenance',
    'Training',
    'Conference',
    'Other'
  ];

  const departments = [
    'Human Resources',
    'Finance',
    'Engineering',
    'Marketing',
    'Sales',
    'Operations',
    'Legal'
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      setCameraStream(stream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setPhoto(imageData);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!photo) {
      alert('Please capture a photo before registering');
      return;
    }

    registerVisitor();
  };

  const registerVisitor = async () => {
    setLoading(true);
    try {
      // Find host employee by name
      const { data: hostEmployee, error: hostError } = await supabase
        .from('users')
        .select('id')
        .eq('name', formData.hostEmployeeName)
        .single();

      if (hostError) {
        console.warn('Host employee not found, proceeding without host_employee_id');
      }

      const badgeNumber = `VIS-${Date.now().toString().slice(-6)}`;
      const qrCode = `QR-${Date.now()}`;

      // Insert visitor into database
      const { data: visitor, error } = await supabase
        .from('visitors')
        .insert({
          full_name: formData.fullName,
          contact_number: formData.contactNumber,
          email: formData.email,
          purpose: formData.purpose,
          host_employee_id: hostEmployee?.id || null,
          host_employee_name: formData.hostEmployeeName,
          host_department: formData.hostDepartment,
          company_name: formData.companyName || null,
          photo_url: photo, // In production, upload to storage first
          badge_number: badgeNumber,
          qr_code: qrCode,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      onRegister(visitor);
      
      // Reset form
      setFormData({
        fullName: '',
        contactNumber: '',
        email: '',
        purpose: '',
        hostEmployeeName: '',
        hostDepartment: '',
        companyName: '',
      });
      setPhoto(null);
      
      alert('Visitor registered successfully!');
    } catch (error) {
      console.error('Error registering visitor:', error);
      alert('Failed to register visitor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Visitor Registration</h1>
        
        {user.role === 'guard' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-blue-800 dark:text-blue-300 text-sm">👮‍♂️ Security Guard Mode: Register visitors upon arrival</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Capture Section */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-4 flex items-center justify-center text-gray-900 dark:text-white">
              <Camera className="w-5 h-5 mr-2" />
              Mandatory Photo Capture
            </h3>
            
            {!photo && !showCamera && (
              <div className="space-y-4">
                <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Camera
                </button>
              </div>
            )}
            
            {showCamera && (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-md mx-auto rounded-lg border-2 border-blue-300"
                  />
                </div>
                <div className="flex space-x-3 justify-center">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capture Photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {photo && (
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={photo} 
                    alt="Captured visitor photo" 
                    className="w-48 h-48 object-cover rounded-lg mx-auto border-2 border-green-300" 
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center mx-auto"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Retake Photo
                </button>
              </div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter visitor's full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Contact Number *
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="+1-555-0123"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="visitor@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Company/Organization
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Company name (optional)"
              />
            </div>
          </div>

          {/* Visit Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Purpose of Visit *
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select purpose</option>
                {purposes.map(purpose => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Host Department *
              </label>
              <select
                name="hostDepartment"
                value={formData.hostDepartment}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Host Employee Name *
              </label>
              <input
                type="text"
                name="hostEmployeeName"
                value={formData.hostEmployeeName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Name of the employee to visit"
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Registration Process:</h4>
            <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>1. Capture visitor photo (mandatory)</li>
              <li>2. Fill in all required information</li>
              <li>3. Submit registration form</li>
              <li>4. Approval request sent to host employee</li>
              <li>5. Digital badge generated upon approval</li>
            </ol>
          </div>

          <button
            type="submit"
            disabled={!photo || loading}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              photo && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Registering...
              </div>
            ) : photo ? 'Register Visitor' : 'Photo Required to Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VisitorRegistration;