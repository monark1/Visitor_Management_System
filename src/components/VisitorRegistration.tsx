import React, { useState, useRef } from 'react';
import { Camera, User, Phone, Mail, Building, Users, Clock, QrCode } from 'lucide-react';

interface VisitorRegistrationProps {
  onRegister: (visitor: any) => void;
}

const VisitorRegistration: React.FC<VisitorRegistrationProps> = ({ onRegister }) => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setPhoto(imageData);
      setShowCamera(false);
      
      // Stop camera stream
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Capture Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Mandatory Photo Capture</h3>
            
            {!photo && !showCamera && (
              <button
                type="button"
                onClick={startCamera}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Camera
              </button>
            )}
            
            {showCamera && (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-md mx-auto rounded-lg"
                />
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Capture Photo
                </button>
              </div>
            )}
            
            {photo && (
              <div className="space-y-4">
                <img src={photo} alt="Visitor" className="w-48 h-48 object-cover rounded-lg mx-auto" />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    startCamera();
                  }}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
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
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Register Visitor
          </button>
        </form>
      </div>
    </div>
  );
};

export default VisitorRegistration;