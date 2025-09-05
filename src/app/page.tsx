"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Lightbulb,
  TrendingUp,
  Handshake,
  LogIn,
  UserPlus,
} from "lucide-react";
import { motion } from "framer-motion";

// Features Data
const features = [
  {
    icon: <Lightbulb className="h-8 w-8 text-white" />,
    title: "Search Phytocompounds",
    description:
      "Quickly look up phytochemical compounds by name, molecular formula, or other properties.",
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-white" />,
    title: "Filter Phytocompounds",
    description:
      "Narrow down results using filters like molecular weight, type, or chemical structure.",
  },
  {
    icon: <Handshake className="h-8 w-8 text-white" />,
    title: "Make Docking Requests",
    description:
      "Submit compounds for molecular docking simulations and receive results seamlessly.",
  },
];

// Background images for Features section
const backgroundImages = [
  "https://res.cloudinary.com/ddljq4uyx/image/upload/v1757067530/p3db1_yduzqb.jpg",
  "https://res.cloudinary.com/ddljq4uyx/image/upload/v1757067530/p3db2_ju4pwe.jpg",
  "https://res.cloudinary.com/ddljq4uyx/image/upload/v1757067530/p3db3_ao5xho.jpg",
  "https://res.cloudinary.com/ddljq4uyx/image/upload/v1757067552/p3db4_hmp6cq.jpg",
  "https://res.cloudinary.com/ddljq4uyx/image/upload/v1757067552/p3db5_zdom5r.jpg",
  "https://res.cloudinary.com/ddljq4uyx/image/upload/v1757067552/p3db6_prz94n.jpg",
  "https://res.cloudinary.com/ddljq4uyx/image/upload/v1757067553/p3db7_wvqpbh.jpg",
  "https://res.cloudinary.com/ddljq4uyx/image/upload/v1757067552/p3db8_x60rsd.jpg",
  "https://res.cloudinary.com/ddljq4uyx/image/upload/v1757067553/p3db9_e1ixqm.jpg",
  "https://res.cloudinary.com/ddljq4uyx/image/upload/v1757067552/p3db10_t5ffct.jpg",
];

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // change every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="container flex-1 flex flex-col items-center justify-center text-center py-20 px-4 animate-fade-in">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center max-w-4xl"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 text-primary">
            Welcome to PhytoDB
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-2xl mb-8">
            A seamless way to explore phytocompounds and accelerate your research
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signin">
              <Button
                size="lg"
                className="h-12 text-lg px-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                variant="outline"
                className="h-12 text-lg px-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Sign Up
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section with Auto-Changing Background */}
      <section
        className="relative w-full py-20 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${backgroundImages[currentImage]})` }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="container relative z-10 flex flex-col items-center text-center px-4 mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg"
          >
           Your Research, Simplified
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white max-w-3xl mb-12 mx-auto drop-shadow"
          >
           Search phytocompounds, filter results, and run docking requests with just a few clicks

          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-card/80 backdrop-blur-md p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center border border-border"
              >
                <div className="bg-primary p-4 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-20 bg-background">
        <div className="container flex flex-col items-center text-center px-4 mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-8 mx-auto"
          >
            Sign up today to explore all the powerful features and gain more knowledge about Phytocompounds.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="h-14 text-xl px-12 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Explore the site <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-8 px-4 border-t border-border/40 text-muted-foreground">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} PhytoDB. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
