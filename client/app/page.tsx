'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, TrendingUp, Shield, Zap, Award, Menu, X, Clock, DollarSign, Target, BarChart3, Globe, Star, Sparkles, ArrowRight, CheckCircle, Building, UserPlus, LogIn, User, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};





export default function HRPortalLanding() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Centralize all employee data and streamline onboarding processes"
    },
    {
      icon: Calendar,
      title: "Leave Management",
      description: "Automate leave requests, approvals, and tracking in real-time"
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Data-driven insights to boost team productivity and growth"
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with full GDPR compliance"
    },
    {
      icon: Zap,
      title: "Automated Workflows",
      description: "Save time with intelligent automation for repetitive tasks"
    },
    {
      icon: Award,
      title: "Recognition Programs",
      description: "Build culture with integrated employee recognition tools"
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Monitor work hours, attendance, and productivity with precision"
    },
    {
      icon: DollarSign,
      title: "Payroll Processing",
      description: "Automate salary calculations, benefits, and tax deductions"
    },
    {
      icon: Target,
      title: "Goal Setting",
      description: "Set and track team and individual objectives seamlessly"
    }
  ];

  const stats = [
    { value: "50K+", label: "Active Users" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "500+", label: "Companies" },
    { value: "24/7", label: "Support" },
    { value: "99.9%", label: "Uptime" },
    { value: "5M+", label: "Hours Saved" }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7 }}
        className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/20 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-2xl font-bold tracking-tight flex items-center">
                HRFlow
              </div>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <motion.a
                href="#features"
                className="hover:text-purple-200 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
              >
                Features
              </motion.a>
              <motion.a
                href="#testimonials"
                className="hover:text-purple-200 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
              >
                Testimonials
              </motion.a>
              <motion.a
                href="#about"
                className="hover:text-purple-200 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
              >
                About
              </motion.a>


              <motion.div className="relative group">
                <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white flex items-center gap-2">
                  <User className="mr-2" size={16} />
                  Company
                  <ChevronDown className="ml-1" size={16} />
                </Button>
                <div className="absolute top-full left-0 mt-1 w-56 bg-black/80 backdrop-blur-lg rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link href="/register/company" className="block px-4 py-2 hover:bg-white/10 text-white items-center gap-2">
                    <UserPlus size={16} />
                    Register Company
                  </Link>
                  <Link href="/login/company" className="block px-4 py-2 hover:bg-white/10 text-white items-center gap-2">
                    <LogIn size={16} />
                    Company Login
                  </Link>
                </div>
              </motion.div>
              <motion.div className="relative group">
                <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white flex items-center gap-2">
                  <Users className="mr-2" size={16} />
                  Employee
                  <ChevronDown className="ml-1" size={16} />
                </Button>
                <div className="absolute top-full right-0 mt-1 w-56 bg-black/80 backdrop-blur-lg rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link href="/login/employee" className="block px-4 py-2 hover:bg-white/10 text-white items-center gap-2">
                    <User size={16} />
                    Employee Login
                  </Link>
                  <Link href="/register/employee" className="block px-4 py-2 hover:bg-white/10 text-white items-center gap-2">
                    <UserPlus size={16} />
                    Register Employee
                  </Link>
                </div>
              </motion.div>
            
            </div>

            <motion.button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-black/30 backdrop-blur-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <motion.a
                href="#features"
                className="block px-3 py-2 hover:bg-white/10 rounded-md"
                whileHover={{ x: 10 }}
              >
                Features
              </motion.a>
              <motion.a
                href="#testimonials"
                className="block px-3 py-2 hover:bg-white/10 rounded-md"
                whileHover={{ x: 10 }}
              >
                Testimonials
              </motion.a>
              <motion.a
                href="#about"
                className="block px-3 py-2 hover:bg-white/10 rounded-md"
                whileHover={{ x: 10 }}
              >
                About
              </motion.a>

              <div className="px-3 py-2 space-y-2">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white flex items-center gap-2">
                    <LogIn className="mr-2" size={16} />
                    Sign In
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button className="w-full bg-linear-to-r from-purple-500 to-pink-500 text-white flex items-center gap-2">
                    <UserPlus className="mr-2" size={16} />
                    Get Started
                  </Button>
                </motion.div>

                <div className="pt-2 border-t border-white/10">
                  <h4 className="font-semibold px-2 py-1 text-sm text-purple-300">Company</h4>
                  <Link href="/register/company" className="block px-3 py-2 hover:bg-white/10 rounded-md items-center gap-2">
                    <UserPlus size={16} />
                    Register Company
                  </Link>
                  <Link href="/login/company" className="block px-3 py-2 hover:bg-white/10 rounded-md items-center gap-2">
                    <LogIn size={16} />
                    Company Login
                  </Link>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <h4 className="font-semibold px-2 py-1 text-sm text-purple-300">Employee</h4>
                  <Link href="/login/employee" className="block px-3 py-2 hover:bg-white/10 rounded-md items-center gap-2">
                    <User size={16} />
                    Employee Login
                  </Link>
                  <Link href="/register/employee" className="block px-3 py-2 hover:bg-white/10 rounded-md items-center gap-2">
                    <UserPlus size={16} />
                    Register Employee
                  </Link>
                </div>
                
               
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>


      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold leading-tight tracking-tight max-w-4xl mx-auto"
            >
              Transform Your <span className="bg-linear-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">HR Operations</span>
              <br />
              <span className="mt-4 block text-3xl md:text-4xl font-normal text-purple-200">
                with Intelligent Automation & Analytics
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto px-4"
            >
              Streamline HR processes, engage employees, and drive business growth with our all-in-one platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button size="lg" className="bg-linear-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 px-8 py-6 text-lg group flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 hover:bg-white/20 px-8 py-6 text-lg flex items-center gap-2">
                <BarChart3 size={20} />
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="pt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-6xl mx-auto"
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 + idx * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-purple-200 mt-2 text-sm md:text-base">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-purple-200">Everything you need to manage your workforce effectively</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="h-full"
              >
                <Card
                  className="bg-linear-to-b from-white/10 to-white/5 backdrop-blur-md border-white/20 hover:from-white/15 hover:to-white/10 transition-all duration-300 hover:scale-[1.02] group h-full flex flex-col"
                >
                  <CardContent className="p-6 grow flex flex-col">
                    <motion.div
                      className="w-14 h-14 bg-linear-to-br from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      <feature.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-purple-200 grow">{feature.description}</p>
                    <motion.div
                      className="mt-4 flex items-center text-sm text-purple-300 font-medium"
                      whileHover={{ x: 5 }}
                    >
                      Learn more <ArrowRight className="ml-1 size-4" />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="bg-linear-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-12 border border-white/20 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-linear-to-br from-purple-600/10 to-pink-600/10"></div>
            <div className="relative z-10">
              <motion.h2
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Ready to Transform Your HR?
              </motion.h2>
              <motion.p
                className="text-xl text-purple-200 mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Join thousands of companies already using HRFlow to streamline their HR operations
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button size="lg" className="bg-linear-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 px-8 py-6 text-lg flex items-center gap-2">
                  Start Your Free Trial
                  <ArrowRight />
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 hover:bg-white/20 px-8 py-6 text-lg flex items-center gap-2">
                  <Globe />
                  Contact Sales
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        id="about"
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                About <span className="bg-linear-to-br from-purple-300 to-pink-300 bg-clip-text text-transparent">HRFlow</span>
              </h2>
              <p className="text-xl text-purple-200 mb-6">
                We&apos;re on a mission to revolutionize HR operations for businesses of all sizes.
              </p>
              <p className="text-lg text-purple-100 mb-8">
                Founded in 2020, HRFlow was created to solve the challenges faced by HR professionals who spend countless hours on manual, repetitive tasks instead of focusing on strategic initiatives that drive company growth.
              </p>

              <div className="space-y-4">
                <motion.div
                  className="flex items-start gap-4"
                  whileHover={{ x: 10 }}
                >
                  <div className="mt-1 w-8 h-8 rounded-full bg-linear-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Our Vision</h3>
                    <p className="text-purple-200">To empower HR professionals with intelligent tools that automate routine tasks and provide actionable insights.</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start gap-4"
                  whileHover={{ x: 10 }}
                >
                  <div className="mt-1 w-8 h-8 rounded-full bg-linear-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center shrink-0">
                    <Target size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Our Mission</h3>
                    <p className="text-purple-200">To simplify HR operations with intuitive, powerful tools that save time and improve decision-making.</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start gap-4"
                  whileHover={{ x: 10 }}
                >
                  <div className="mt-1 w-8 h-8 rounded-full bg-linear-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center shrink-0">
                    <Award size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Our Values</h3>
                    <p className="text-purple-200">Integrity, Innovation, and putting people first in everything we do.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative aspect-square bg-linear-to-br from-purple-500/20 to-pink-500/20 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-purple-600 to-pink-500 mb-6">
                      <Users size={48} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">People First Approach</h3>
                    <p className="text-purple-200 max-w-md">Designed by HR professionals for HR professionals</p>
                  </div>
                </div>
                <div className="absolute -inset-4 bg-linear-to-br from-purple-600/10 to-pink-600/10 rounded-3xl blur-xl opacity-50"></div>
              </div>

              <motion.div
                className="absolute -bottom-6 -left-6 w-32 h-32 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>

              <motion.div
                className="absolute -top-6 -right-6 w-24 h-24 bg-linear-to-br from-pink-500/20 to-red-500/20 rounded-full blur-xl"
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Login/Register Options Section */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Access Your Account</h2>
            <p className="text-xl text-purple-200">Choose your role to continue</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Company Section */}
            <motion.div
              className="bg-linear-to-b from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center mx-auto mb-6">
                <Building size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Company Access</h3>
              <p className="text-purple-200 mb-6">Register your company or sign in to manage your employees</p>

              <div className="space-y-4">
                <a href="/register/company">
                  <Button
                    className="w-full bg-linear-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 py-6 text-lg"
                    size="lg"
                  >
                    <UserPlus className="mr-2" />
                    Register Company
                  </Button>
                </a>
                <a href="/login/company">
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/30 hover:bg-white/20 py-6 text-lg"
                    size="lg"
                  >
                    <LogIn className="mr-2" />
                    Company Login
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Employee/User Section */}
            <motion.div
              className="bg-linear-to-b from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Employee Access</h3>
              <p className="text-purple-200 mb-6">Sign in to access your personal HR dashboard</p>

              <div className="space-y-4">
                <a href="/login/employee">
                  <Button
                    className="w-full bg-linear-to-br from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 py-6 text-lg"
                    size="lg"
                  >
                    <User className="mr-2" />
                    Employee Login
                  </Button>
                </a>
                <a href="/register/employee">
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/30 hover:bg-white/20 py-6 text-lg"
                    size="lg"
                  >
                    <UserPlus className="mr-2" />
                    Register Employee
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-xl text-purple-200">Join thousands of companies transforming their HR operations</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                className="bg-linear-to-b from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: item * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold">Sarah Johnson</h4>
                    <p className="text-purple-300 text-sm">HR Director, TechCorp</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-purple-100">&quot;HRFlow transformed how we manage our workforce. The automation features saved us 15+ hours per week on routine tasks.&quot;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="text-purple-300" size={24} />
                HRFlow
              </div>
              <p className="text-purple-200">Transforming HR operations with intelligent automation and analytics.</p>
              <div className="flex gap-4 mt-4">
                <motion.a href="#" className="text-purple-300 hover:text-white" whileHover={{ y: -3 }}>
                  <Globe size={20} />
                </motion.a>
                <motion.a href="#" className="text-purple-300 hover:text-white" whileHover={{ y: -3 }}>
                  <Users size={20} />
                </motion.a>
                <motion.a href="#" className="text-purple-300 hover:text-white" whileHover={{ y: -3 }}>
                  <Shield size={20} />
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="text-purple-300" size={16} />
                Product
              </h4>
              <ul title='Product' className="space-y-2 text-purple-200">
                <motion.li whileHover={{ x: 5 }}><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><CheckCircle size={14} /> Features</a></motion.li>
                <motion.li whileHover={{ x: 5 }}><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><DollarSign size={14} /> Pricing</a></motion.li>
                <motion.li whileHover={{ x: 5 }}><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Shield size={14} /> Security</a></motion.li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="text-purple-300" size={16} />
                Company
              </h4>
              <ul className="space-y-2 text-purple-200">
                <motion.li whileHover={{ x: 5 }}><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Users size={14} /> About</a></motion.li>
                <motion.li whileHover={{ x: 5 }}><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Globe size={14} /> Blog</a></motion.li>
                <motion.li whileHover={{ x: 5 }}><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Award size={14} /> Careers</a></motion.li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="text-purple-300" size={16} />
                Support
              </h4>
              <ul className="space-y-2 text-purple-200">
                <motion.li whileHover={{ x: 5 }}><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Shield size={14} /> Help Center</a></motion.li>
                <motion.li whileHover={{ x: 5 }}><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Globe size={14} /> Contact</a></motion.li>
                <motion.li whileHover={{ x: 5 }}><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Clock size={14} /> Status</a></motion.li>
              </ul>
            </motion.div>
          </div>
          <div className="text-center text-purple-200 pt-8 border-t border-white/10">
            <p>© 2026 HRFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out backwards;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}