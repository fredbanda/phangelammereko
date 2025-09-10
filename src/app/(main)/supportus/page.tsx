"use client";

import Image from "next/image";
import Support from "../../../../public/resume.png";
import { useState } from "react";

export default function SupportPage() {
    const [amount, setAmount] = useState(50); // default amount
  const [paymentMethod, setPaymentMethod] = useState("card");

  const presetAmounts = [10, 50, 100, 500, 1000];

  const handleSubmit = () => {
   
    console.log("Donation Amount:", amount);
    console.log("Payment Method:", paymentMethod);
  };

  const handleAmountChange = () => {
 
  };
    
  return (
    <>
      <section className="bg-[#C2EFD4]  flex items-center">
        <div className="container mx-auto px-6 py-12 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-[#224f34] text-4xl md:text-5xl lg:text-6xl xl:text-[72px] font-bold font-rufina leading-tight mb-6">
                We want to help more unemployed people!
              </h1>
              <p className="text-[#267d49] text-xl lg:text-2xl font-medium font-poppins leading-relaxed mb-8">
                You can donate to help more unemployed get their CV allowing
                them to get a job. Share this page or donate for hosting
              </p>
              <button className="px-8 py-4 text-white text-lg font-medium font-poppins uppercase bg-[#224e34] rounded-[3px] shadow-lg hover:bg-[#1a3a27] transition-colors">
                Contact Us
              </button>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <Image
                className="  rounded-lg shadow-xl"
                src={Support}
                alt="Children benefiting from donations"
                width={300}
                height={100}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
              Make a Donation
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              {/* Donation Amount */}
              <div>
                <div className="mb-8">
                  <label className="block text-gray-700 font-medium mb-4 text-xl">
                    Donation Amount
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-6">
                    {presetAmounts.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className={`py-4 rounded-md text-lg font-medium transition-colors ${
                          amount === val
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        R{val}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      R
                    </span>
                    <input
                      type="number"
                      value={amount}
                    
                      placeholder="Other amount"
                      className="w-full pl-14 pr-6 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xl"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <div className="mb-8">
                  <label className="block text-gray-700 font-medium mb-4 text-xl">
                    Payment Method
                  </label>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-400 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="h-6 w-6 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="flex items-center text-xl">
                        💳 Credit/Debit Card
                      </span>
                    </label>
                    <label className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-400 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="mobile"
                        checked={paymentMethod === 'mobile'}
                        onChange={() => setPaymentMethod('mobile')}
                        className="h-6 w-6 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xl">📱 Mobile Money</span>
                    </label>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-5 px-8 rounded-lg hover:bg-emerald-700 transition-colors font-bold text-xl flex items-center justify-center gap-4 shadow-lg"
                >
                  ❤️ Complete Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
 </>
  );
}