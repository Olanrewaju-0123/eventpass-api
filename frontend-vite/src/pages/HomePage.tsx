import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, Ticket } from "lucide-react";
import EventsImage from "../assets/Events.jpeg";
import QRCodeImage from "../assets/QR code.png";
import LogoImage from "../assets/logo.png";
import StepImage from "../assets/step.png";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center">
              <img
                src={LogoImage}
                alt="EventPass Logo"
                className="h-20 w-auto object-contain"
                style={{
                  filter: "hue-rotate(200deg) saturate(1.2) brightness(0.9)",
                }}
              />
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-primary-600 transition-colors py-2 px-3"
              >
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="py-20 relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${EventsImage})`,
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            Discover Amazing
            <span className="text-yellow-400"> Events</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Find, book, and attend the best events in your city. From concerts
            to conferences, we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/events"
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
            >
              Browse Events
            </Link>
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose EventPass?
            </h2>
            <p className="text-lg text-gray-600">
              We make event discovery and booking simple and secure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy Discovery
              </h3>
              <p className="text-gray-600">
                Find events by category, location, or date with our powerful
                search and filtering system.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Booking
              </h3>
              <p className="text-gray-600">
                Book tickets with confidence using our secure payment system and
                instant confirmation.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Community Driven
              </h3>
              <p className="text-gray-600">
                Join a community of event enthusiasts and discover new
                experiences together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Quick Start to Get a Ticket
            </h2>
            <p className="text-lg text-gray-600">
              Follow these simple steps to book your event tickets in minutes
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src={StepImage}
              alt="How to get tickets - Step by step process"
              className="w-full max-w-4xl h-auto object-contain rounded-lg shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 hover:brightness-110 cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-block bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
                EventPass
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of users who trust EventPass for their event
                needs. Download our app and start discovering amazing events
                today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
                >
                  Create Account
                </Link>
                <Link
                  to="/events"
                  className="border border-primary-600 text-primary-600 hover:bg-primary-50 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
                >
                  Browse Events
                </Link>
              </div>
            </div>

            {/* Right Side - QR Code Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img
                  src={QRCodeImage}
                  alt="EventPass QR Code"
                  className="w-80 h-80 object-contain rounded-2xl shadow-lg"
                />
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  Scan to Download
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-gray-400">
              © 2025 EventPass. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
