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

    const [loading, setLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

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

    // Load PayPal SDK and render buttons once.  To avoid the "delegate rendering" error
    // we only initialize the SDK a single time and clear the container on every render attempt
    // rather than letting the library try to mount multiple instances into the same node.
    // Also we keep refs for mutable state so that the one Buttons instance always reads
    // up-to-date values without re-creating itself on every keystroke.

    const termsRef = React.useRef(termsAccepted);
    const formRef = React.useRef(formData);
    useEffect(() => { termsRef.current = termsAccepted; }, [termsAccepted]);
    useEffect(() => { formRef.current = formData; }, [formData]);

    useEffect(() => {
        const renderButtons = () => {
            // wipe container in case a previous render left things behind
            const container = document.getElementById('paypal-buttons-container');
            if (container) container.innerHTML = '';

            window.paypal.Buttons({
                createOrder: async () => {
                    const terms = termsRef.current;
                    const form = formRef.current;
                    if (!terms) {
                        alert('Please accept the conditions of use.');
                        throw new Error('Terms not accepted');
                    }
                    if (form.email !== form.confirmEmail) {
                        alert('Emails do not match!');
                        throw new Error('Emails mismatch');
                    }
                    setLoading(true);
                    const res = await fetch('/api/paypal-create-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: (price * 1.10).toFixed(2) })
                    });
                    const data = await res.json();
                    setLoading(false);
                    if (!res.ok) {
                        console.error('server error creating order', data);
                        throw new Error(data.error || data.details || 'create-order failed');
                    }
                    if (!data.id) {
                        console.error('no order id', data);
                        throw new Error('No order id returned');
                    }
                    return data.id;
                },
                onApprove: async (data) => {
                    await handleDirectOrder(data.orderID);
                },
                onError: (err) => {
                    console.error('PayPal Buttons error', err);
                    alert('PayPal error occurred');
                }
            }).render('#paypal-buttons-container');
        };

        const existing = document.getElementById('paypal-sdk');
        if (window.paypal && window.paypal.Buttons) {
            // SDK already loaded and ready
            renderButtons();
            return;
        }

        if (!existing) {
            const script = document.createElement('script');
            script.id = 'paypal-sdk';
            const paypalEnv = import.meta.env.VITE_PAYPAL_ENV || 'production';
            let src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
            script.src = src;
            script.onload = renderButtons;
            script.onerror = (e) => console.error('PayPal SDK failed to load', e);
            document.body.appendChild(script);
        } else {
            // script tag exists but may still be loading
            existing.addEventListener('load', renderButtons);
            // clean up listener if unmounting
            return () => existing.removeEventListener('load', renderButtons);
        }
    }, [price]);

    // legacy capture code removed
    // Handlers
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });


    // 2. SUBMIT ORDER (handled by PayPal Buttons)
    const handleDirectOrder = async (orderID) => {
        // orderID supplied by PayPal SDK after approval
        setLoading(true);

        try {
            const captureRes = await fetch("/api/paypal-capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID })
            });
            const captureData = await captureRes.json();
            if (!captureData.success) throw new Error('Capture failed');

            // read the freshest data from the ref rather than the closed-over state
            const current = formRef.current;
            const orderPayload = {
                full_name: current.full_name,
                email: current.email,
                address: current.address,
                city: current.city,
                province: current.province,
                postal_code: current.postal_code,
                vin: current.vinNo,
                plan_name: planName,
                price: price,
                payment_status: "PAID"
            };

            await fetch("/api/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderPayload)
            });

            alert("✅ Payment Successful!");
            navigate("/success");
        } catch (err) {
            console.error(err);
            alert("Payment error occurred");
        } finally {
            setLoading(false);
        }
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
                    <form onSubmit={handleDirectOrder}>

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

                        {/* PayPal button container (Pay Now text removed; SDK handles UI) */}
                        <div id="paypal-buttons-container" className="w-full" />
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
