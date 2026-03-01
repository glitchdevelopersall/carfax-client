import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const Success = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 rounded-full p-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="text-3xl font-bold text-gray-800 mb-3">
                    Payment Successful!
                </h1>
                <p className="text-gray-600 mb-6">
                    Thank you for your purchase. Your order has been confirmed and you will receive a confirmation email shortly.
                </p>

                {/* Details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                    <h3 className="font-semibold text-gray-800 mb-3">What's Next?</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span>Check your email for the order confirmation</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span>Your vehicle report will be generated shortly</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span>You can access your reports anytime from your account</span>
                        </li>
                    </ul>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                        Back to Home
                    </button>
                    <button
                        onClick={() => navigate('/get-report')}
                        className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                        View Your Report
                    </button>
                </div>

                {/* Support */}
                <p className="text-sm text-gray-500 mt-6">
                    Need help? Contact our{' '}
                    <a href="/support" className="text-blue-600 hover:underline">
                        support team
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Success;
