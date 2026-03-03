import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// --- CONFIGURATION ---
// CHANGE THIS if your backend is hosted (e.g., "https://my-api.onrender.com")

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 1. GET DATA
    const {
        planName = "Vehicle History Report + Lien Check",
        price = 77.95,
        vin = "1FM5K8D87TESTVIN",
    } = location.state || {};

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        full_name: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        vinNo: '',
        email: '',
        confirmEmail: ''
    });

    // Pre-fill VIN
    useEffect(() => {
        if (vin) setFormData(prev => ({ ...prev, vinNo: vin }));
    }, [vin]);

    // mapping for the three fixed PayPal links
    const linkMap = {
        45: 'https://www.paypal.com/ncp/payment/JNQL58DH9NY8L',
        75: 'https://www.paypal.com/ncp/payment/6T5H69FWCTW2Q',
        100: 'https://www.paypal.com/ncp/payment/Y9VFYLBB2QKSW'
    };
    const checkoutUrl = linkMap[price] || linkMap[45];

    // Handlers
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!termsAccepted) {
            alert('Please accept the conditions of use.');
            return;
        }
        if (formData.email !== formData.confirmEmail) {
            alert('Emails do not match!');
            return;
        }

        // save order data with pending status
        setSaving(true);
        try {
            const payload = {
                full_name: formData.full_name,
                email: formData.email,
                address: formData.address,
                city: formData.city,
                province: formData.province,
                postal_code: formData.postal_code,
                vin: formData.vinNo,
                plan_name: planName,
                price: price,
                payment_status: 'Pending'
            };

            const res = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                console.error('order save failed', data);
                alert('Could not save order. Please try again.');
                return;
            }
        } catch (err) {
            console.error('save order error', err);
            alert('Unable to save order before redirect.');
            return;
        } finally {
            setSaving(false);
        }

        // redirect to the PayPal checkout link
        window.location.href = checkoutUrl;
    };

    return (
        <div className="min-h-screen bg-white font-sans pb-20 text-gray-800">

            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <button onClick={() => navigate(-1)} className="flex items-center text-black font-bold text-lg hover:opacity-70 transition bg-transparent border-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Back
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-16">

                {/* LEFT: FORM */}
                <div className="lg:col-span-7 order-2 lg:order-1">
                    <form onSubmit={handleSubmit}>

                        {/* CUSTOMER INFO */}
                        <div className="mb-10">
                            <h2 className="text-xl font-bold text-gray-600 mb-6">Customer Information</h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Name *</label>
                                    <input name="full_name" required value={formData.full_name} onChange={handleChange} type="text" className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">Street Address *</label>
                                        <input name="address" required value={formData.address} onChange={handleChange} type="text" className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">City *</label>
                                        <input name="city" required value={formData.city} onChange={handleChange} type="text" className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">Country *</label>
                                        <select className="w-full border border-gray-300 rounded-md p-2.5 bg-white outline-none focus:border-blue-500"><option>USA</option><option>Germany</option><option>Canada</option><option>France</option><option>Italy</option><option>Spain</option><option>Netherland</option><option>Other</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">Province *</label>
                                        <input name="province" required value={formData.province} onChange={handleChange} type="text" className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">Postal Code *</label>
                                        <input name="postal_code" required value={formData.postal_code} onChange={handleChange} type="text" className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">VIN Number *</label>
                                    <input name="vinNo" required value={formData.vinNo} onChange={handleChange} type="text" className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Email *</label>
                                    <input name="email" required value={formData.email} onChange={handleChange} type="email" className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Confirm Email *</label>
                                    <input name="confirmEmail" required value={formData.confirmEmail} onChange={handleChange} type="email" className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-200 my-10"></div>

                        {/* PAYMENT SECTION (NOW ACTIVE) */}

                        {/* Terms */}
                        <div className="flex items-start mb-8 mt-6">
                            <input type="checkbox" id="terms" className="mt-1 w-5 h-5 border-gray-300 rounded cursor-pointer" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                            <label htmlFor="terms" className="ml-3 text-sm text-gray-600">I agree to Conditions of Use</label>
                        </div>

                        {/* Direct PayPal link instead of SDK button */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 text-white py-3 rounded-md hover:opacity-90 transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : `Pay ${price.toFixed(2)} via PayPal`}
                        </button>
                    </form>
                </div>

                {/* RIGHT: SUMMARY */}
                <div className="lg:col-span-5 order-1 lg:order-2">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-600 mb-6">Order Summary</h2>
                        <div className="flex justify-between items-start mb-4">
                            <div className="pr-4">
                                <h3 className="font-bold text-gray-700 text-sm">{planName}</h3>
                                <p className="text-xs text-gray-500 mt-1">VIN: {formData.vinNo || "..."}</p>
                            </div>
                            <div className="font-bold text-gray-700 text-lg">${price.toFixed(2)}</div>
                        </div>

                        <ul className="space-y-2 mb-6 text-sm text-gray-600">
                            <SummaryItem text="Accident and damage history" />
                            <SummaryItem text="Recall information" />
                            <SummaryItem text="Lien Check Included" />
                        </ul>

                        <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-500 text-sm">SubTotal</span>
                                <span className="text-gray-700 font-medium">${price.toFixed(2)}</span>
                            </div>
                            {/* <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-500 text-sm">Tax (10%)</span>
                                <span className="text-gray-700 font-medium">${(price * 0.10).toFixed(2)}</span>
                            </div> */}
                            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                                <span className="font-bold text-gray-800">Total</span>
                                <span className="font-bold text-gray-600 text-xl">${price.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper for list items
const SummaryItem = ({ text }) => (
    <li className="flex items-center">
        <span className="mr-2 bg-[#88c425] rounded-full p-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </span>
        {text}
    </li>
);

export default CheckoutPage;
