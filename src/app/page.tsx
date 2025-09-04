"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb, TrendingUp, Handshake, LogIn, UserPlus } from "lucide-react";
import { motion } from "framer-motion"; // Assuming framer-motion is available for advanced animations
const features = [
  {
    icon: <Lightbulb className="h-8 w-8 text-white" />,
    title: "Innovative Solutions",
    description: "Our platform leverages cutting-edge technology to provide solutions that are both smart and efficient."
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-white" />,
    title: "Performance Driven",
    description: "Focus on results with a system designed for high performance and reliability, no matter the scale."
  },
  {
    icon: <Handshake className="h-8 w-8 text-white" />,
    title: "Collaborative Community",
    description: "Join a community of like-minded individuals to share ideas and grow together."
  },
];

export default function Home() {
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
          {/* <div className="mb-8">
            <Image
              src="https://placehold.co/150x150/2563EB/ffffff?text=College+Logo"
              alt="College Logo Placeholder"
              width={150}
              height={150}
              className="rounded-full shadow-lg"
            />
          </div> */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 text-primary">
            Welcome to MyApp
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-2xl mb-8">
            A powerful platform for your college needs. Built for a seamless and integrated experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signin">
              {/* Updated Sign In button with LogIn icon */}
              <Button size="lg" className="h-12 text-lg px-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              {/* Updated Sign Up button with UserPlus icon */}
              <Button size="lg" variant="outline" className="h-12 text-lg px-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <UserPlus className="mr-2 h-5 w-5" />
                Sign Up
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section with Rombo Effect */}




      {/* start of component */}



      <section className="relative w-full py-20 bg-muted">
        <div className="absolute inset-0 z-0 overflow-hidden">
          
          {/* Rombo effect with a slanted background */}
          <div className="absolute inset-0 bg-primary/10 transform -skew-y-3"></div>
        </div>
        
        <div className="container relative z-10 flex flex-col items-center text-center px-4 mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }} 
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            Features at a Glance
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-12 mx-auto"
          >
            We have built a platform with the tools you need to succeed. From research to collaboration, everything is at your fingertips.
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-card p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center border border-border"
              >
                <div className="bg-primary p-4 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

{/*end of component*/}



      {/* Another Section with a call to action */}
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
            Sign up today to explore all the powerful features and connect with your community.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/signup">
              <Button size="lg" className="h-14 text-xl px-12 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full text-center py-8 px-4 border-t border-border/40 text-muted-foreground">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} MyApp. All rights reserved.
        </p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <Link href="/about" className="hover:underline hover:underline-offset-4">
            About
          </Link>
          <Link href="/contact" className="hover:underline hover:underline-offset-4">
            Contact
          </Link>
          <Link href="/privacy" className="hover:underline hover:underline-offset-4">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}

// Add these keyframes to your global CSS file (e.g., globals.css)
/*
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}
*/
