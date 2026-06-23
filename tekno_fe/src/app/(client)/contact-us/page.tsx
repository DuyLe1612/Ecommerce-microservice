"use client";

import { Container } from "@/components/MainLayout/Container";
import { Breadcrumb } from "@/components/share/breadcumbCustom";
import React, { useState } from "react";
import { MapPin, Mail, Phone as PhoneIcon } from "lucide-react";

export default function page() {
  // mock data
  const office = {
    title: "Office",
    addressLine1: "Thu Duc City",
    addressLine2: "Ho Chi Minh City, Vietnam",
  };
  const email = "tekno@gmail.com";
  const phone = "+84 37 839 2202";

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(name, mail, message);
  };

  return (
    <Container className="grid grid-cols-12 gap-6 py-6">
      <div className="col-span-12">
        <Breadcrumb />
      </div>

      {/* top contact cards */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#111111] border border-gray-800 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(255,213,0,0.1)] transition-all duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary shadow-[0_0_10px_rgba(255,213,0,0.1)] flex items-center justify-center group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-bold text-white mb-1">Office</div>
            <div className="text-sm text-gray-400 leading-relaxed">
              {office.addressLine1}
              <br />
              {office.addressLine2}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#111111] border border-gray-800 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(255,213,0,0.1)] transition-all duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary shadow-[0_0_10px_rgba(255,213,0,0.1)] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-bold text-white mb-1">Email</div>
            <div className="text-sm text-gray-400">{email}</div>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#111111] border border-gray-800 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(255,213,0,0.1)] transition-all duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary shadow-[0_0_10px_rgba(255,213,0,0.1)] flex items-center justify-center group-hover:scale-110 transition-transform">
            <PhoneIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-bold text-white mb-1">Phone</div>
            <div className="text-sm text-gray-400">{phone}</div>
          </div>
        </div>
      </div>

      {/* body: message text + form */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* left description */}
        <div className="border border-gray-800 rounded-2xl p-8 bg-[#111111] shadow-lg flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-[40px] pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
          <div className="text-2xl font-bold mb-4 text-white tracking-tight relative z-10">Message us</div>
          <div className="text-base text-gray-400 leading-relaxed relative z-10">
            We're here to assist you every step of the way. Whether you have a
            question, need technical support, or simply want to share your
            feedback, our dedicated team is ready to listen and provide prompt
            assistance.
          </div>
        </div>

        {/* right form */}
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 border border-gray-800 rounded-2xl p-8 bg-[#111111] shadow-lg"
        >
          <input
            type="text"
            placeholder="* Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-gray-800 text-white placeholder:text-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            required
          />
          <input
            type="email"
            placeholder="* Email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-gray-800 text-white placeholder:text-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            required
          />
          <textarea
            placeholder="Message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-gray-800 text-white placeholder:text-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none shadow-inner"
          />
          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-primary px-4 py-3 text-base font-bold text-black hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
          >
            Submit
          </button>
        </form>
      </div>
    </Container>
  );
}
