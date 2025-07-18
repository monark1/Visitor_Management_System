import React, { useState, useRef } from 'react';
import { Camera, User, Phone, Mail, Building, Users, Clock, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

    const visitor = {
      id: Date.now().toString(),
      ...formData,
      photo,
      checkInTime: new Date(),
      status: 'pending',
      badgeNumber: `VIS-${Date.now().toString().slice(-6)}`,
      qrCode: `QR-${Date.now()}`,
    };

    // For guards, show success message
    if (user.role === 'guard') {
      alert(`Visitor ${visitor.fullName} has been registered successfully! Approval request sent to ${visitor.hostEmployeeName}.`);
    }
    
    // For admin, show admin-specific message
    if (user.role === 'admin') {
      alert(`Visitor ${visitor.fullName} has been registered by admin. Processing approval...`);
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
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Visitor Registration</h1>
        
        {user.role === 'guard' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">👮‍♂️ Security Guard Mode: Register visitors upon arrival</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Capture Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-4 flex items-center justify-center">
              <Camera className="w-5 h-5 mr-2" />
              Mandatory Photo Capture
            </h3>
            
            {!photo && !showCamera && (
              <div className="space-y-4">
                <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-400" />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter visitor's full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Contact Number *
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1-555-0123"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="visitor@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Company/Organization
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Company name (optional)"
              />
            </div>
          </div>

          {/* Visit Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Purpose of Visit *
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select purpose</option>
                {purposes.map(purpose => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Host Department *
              </label>
              <select
                name="hostDepartment"
                value={formData.hostDepartment}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Host Employee Name *
              </label>
              <input
                type="text"
                name="hostEmployeeName"
                value={formData.hostEmployeeName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Name of the employee to visit"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Registration Process:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Capture visitor photo (mandatory)</li>
              <li>2. Fill in all required information</li>
              <li>3. Submit registration form</li>
              <li>4. Approval request sent to host employee</li>
              <li>5. Digital badge generated upon approval</li>
            </ol>
          </div>

          <button
            type="submit"
            disabled={!photo}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              photo 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {photo ? 'Register Visitor' : 'Photo Required to Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VisitorRegistration;