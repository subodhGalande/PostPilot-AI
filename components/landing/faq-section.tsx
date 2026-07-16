"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const faqs = [
  {
    question: "What platforms does PostPilot support?",
    answer: "Currently, PostPilot is highly optimized for generating content specifically tailored for X (formerly Twitter) and LinkedIn. We focus deeply on the unique formats, constraints, and cultures of these two platforms."
  },
  {
    question: "Does PostPilot automatically schedule my posts?",
    answer: "No. PostPilot is a pure generation and management tool. We believe you should retain full control over your posting schedule. Once you're happy with a generated post, you can easily copy and paste it into your preferred publishing tool or directly into the social platforms."
  },
  {
    question: "How much does it cost?",
    answer: "PostPilot is currently free to use! Every user gets a daily allowance of 10 generation tokens to create posts for X and LinkedIn. Your tokens reset every single day."
  },
  {
    question: "Can I manage my generated posts?",
    answer: "Yes, you have a built-in workspace where you can save drafts, view your generated content on a visual calendar layout, and refine them until they are ready to publish."
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-32 bg-background relative">
      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Signature Section Header - Matches reference layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="md:w-2/3">
            <h2 className="font-heading text-4xl md:text-5xl font-semibold tracking-tighter text-foreground mb-4 leading-tight text-balance">
              Frequently asked <br className="hidden md:block" /> questions.
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl text-pretty tracking-tight">
              Everything you need to know about the product, platform support, and how the generation engine works.
            </p>
          </div>
          <div>
             <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 h-10 shadow-sm shadow-primary/20 font-medium">
               <Link href="/signup">
                 Get started free <ArrowRight className="ml-2 h-4 w-4" />
               </Link>
             </Button>
          </div>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:border-primary/20 transition-colors"
            >
              <button
                id={`faq-button-${index}`}
                aria-expanded={openIndex === index}
                aria-controls={`faq-content-${index}`}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none group"
              >
                <span className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors text-balance pr-8">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-muted-foreground/60 transition-transform duration-300 ${openIndex === index ? "rotate-180 text-primary" : "group-hover:text-primary/70"}`} 
                />
              </button>
              
              <motion.div
                id={`faq-content-${index}`}
                role="region"
                aria-labelledby={`faq-button-${index}`}
                initial={false}
                animate={{ height: openIndex === index ? "auto" : 0, opacity: openIndex === index ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-8 pb-6 text-muted-foreground leading-relaxed text-base max-w-3xl text-pretty">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
