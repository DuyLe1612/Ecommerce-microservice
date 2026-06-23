"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import faqBanner from "./../../../../public/faq.png";
import Image from "next/image";
import { Breadcrumb } from "@/components/share/breadcumbCustom";

type TocSection = {
  key: string;
  label: string;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  section: string; // map to TocSection.key
};

const toc: TocSection[] = [
  { key: "general", label: "General" },
  { key: "trust", label: "Trust & Safety" },
  { key: "services", label: "Services" },
  { key: "billing", label: "Billing" },
];

const faqs: FaqItem[] = [
  {
    id: "q1",
    section: "general",
    question:
      "Can I purchase products from Tech Heim using installment payments?",
    answer:
      "Yes, Tech Heim offers the option to purchase products using both cash and installment payments. This allows you to choose the payment method that suits your needs and budget.",
  },
  {
    id: "q2",
    section: "services",
    question: "How can I engage with the magazine content on Tech Heim?",
    answer:
      "You can actively engage with the magazine content by leaving comments and participating in the question-and-answer section. Feel free to share your thoughts, ask questions, and interact with fellow tech enthusiasts in the community.",
  },
  {
    id: "q3",
    section: "services",
    question: "Does Tech Heim offer a warranty on its products?",
    answer:
      "Yes, Tech Heim provides a warranty on all eligible products. The specific warranty details may vary depending on the manufacturer and product category. Please refer to the product description or contact our customer support for more information.",
  },
  {
    id: "q4",
    section: "trust",
    question: "Is Tech Heim a secure platform for online shopping?",
    answer:
      "Yes, Tech Heim follows industry best practices to ensure a secure shopping experience. Your data is protected with encryption and strict access controls.",
  },
  {
    id: "q5",
    section: "billing",
    question:
      "How can I get assistance with my purchase or any other inquiries?",
    answer:
      "If you need assistance with your purchase or have any questions, our dedicated customer support team is here to help. You can reach out to us through the contact page on our website, and we'll be happy to assist you promptly.",
  },
];

export default function Page() {
  return (
    <>
      <div className="max-w-[1200px] mx-auto grid grid-cols-12 gap-6 px-4 py-8">
        <Breadcrumb />

        {/* Banner */}
        <div className="col-span-12">
          <Image
            src={faqBanner}
            alt="FAQ Banner"
            className="rounded-lg mb-6 w-full object-cover"
            priority
          />
        </div>

        {/* Table of contents (sidebar) */}
        <aside className="col-span-12 md:col-span-3 bg-[#111111] p-5 rounded-2xl shadow-lg border border-gray-800 h-fit sticky top-24">
          <h3 className="font-bold text-xl mb-4 text-white tracking-tight">
            Table of Contents
          </h3>
          <ul className="space-y-3 text-gray-400">
            {toc.map((t) => (
              <li key={t.key} className="hover:text-primary transition-colors cursor-pointer font-medium flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-primary transition-colors"></span>
                {t.label}
              </li>
            ))}
          </ul>
        </aside>

        {/* FAQ content */}
        <section className="col-span-12 md:col-span-9 space-y-4">
          <Accordion type="multiple" className="space-y-4">
            {faqs.map((f) => (
              <AccordionItem
                key={f.id}
                value={f.id}
                className="rounded-2xl border border-gray-800 bg-[#111111] px-5 shadow-sm hover:border-primary/30 transition-all duration-300"
              >
                <AccordionTrigger className="text-white hover:text-primary font-semibold py-4 hover:no-underline transition-colors text-left text-lg">
                  {f.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 py-3 leading-relaxed text-base">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </>
  );
}
