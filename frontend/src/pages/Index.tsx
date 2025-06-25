import { Button } from "@/components/ui/button";
import { Users, Building2, ChevronRight, Zap, Shield, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative animate-fade-in">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      
      {/* Header overlaid on top */}
      <Header />
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-6 py-20 mt-12 md:mt-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-default">
              CacheOut
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 hover:text-gray-200 transition-colors duration-300">
              The global marketplace for computing power. Buy or sell compute resources instantly with enterprise-grade security and reliability.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/waitlist')}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Get Started
            </Button>
          </div>
          
          {/* User Type Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
            {/* Individuals Card */}
            <div 
              className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 hover:bg-white/8 transition-all duration-500 cursor-pointer hover:scale-105"
              onClick={() => navigate('/individuals')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 group-hover:from-indigo-500/20 group-hover:to-purple-600/20 transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="mb-6 p-4 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full backdrop-blur-sm w-fit">
                  <Users className="h-8 w-8 text-indigo-300" />
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                  Individuals
                </h3>
                
                <p className="text-gray-300 mb-6 leading-relaxed hover:text-gray-200 transition-colors duration-300">
                  Perfect for developers, researchers, and creators who need access to powerful computing resources or want to monetize their hardware.
                </p>
                
                <div className="flex items-center text-indigo-300 group-hover:text-indigo-200 transition-colors">
                  <span className="font-semibold">Get Started</span>
                  <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
            
            {/* Enterprises Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 hover:bg-white/8 transition-all duration-500 cursor-not-allowed opacity-60">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-600/10 group-hover:from-emerald-500/20 group-hover:to-blue-600/20 transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="mb-6 p-4 bg-gradient-to-br from-emerald-500/20 to-blue-600/20 rounded-full backdrop-blur-sm w-fit">
                  <Building2 className="h-8 w-8 text-emerald-300" />
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 bg-gradient-to-r from-emerald-300 to-blue-300 bg-clip-text text-transparent">
                  Enterprises
                </h3>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Scalable solutions for businesses that need reliable, high-performance computing infrastructure with enterprise-grade support.
                </p>
                
                <div className="flex items-center text-gray-400">
                  <span className="font-semibold">Coming Soon</span>
                  <ChevronRight className="h-5 w-5 ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-default">
              Why CacheOut?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto hover:text-gray-200 transition-colors duration-300">
              Built for the modern world of distributed computing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6 hover:scale-105 transition-transform duration-300">
              <div className="mb-6 p-4 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full backdrop-blur-sm w-fit mx-auto">
                <Zap className="h-8 w-8 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 hover:text-gray-200 transition-colors duration-300">Instant Access</h3>
              <p className="text-gray-300 hover:text-gray-200 transition-colors duration-300">Get compute resources in seconds, not hours</p>
            </div>

            <div className="text-center p-6 hover:scale-105 transition-transform duration-300">
              <div className="mb-6 p-4 bg-gradient-to-br from-emerald-500/20 to-blue-600/20 rounded-full backdrop-blur-sm w-fit mx-auto">
                <Shield className="h-8 w-8 text-emerald-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 hover:text-gray-200 transition-colors duration-300">Enterprise Security</h3>
              <p className="text-gray-300 hover:text-gray-200 transition-colors duration-300">Bank-grade security for all transactions</p>
            </div>

            <div className="text-center p-6 hover:scale-105 transition-transform duration-300">
              <div className="mb-6 p-4 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full backdrop-blur-sm w-fit mx-auto">
                <Globe className="h-8 w-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 hover:text-gray-200 transition-colors duration-300">Global Network</h3>
              <p className="text-gray-300 hover:text-gray-200 transition-colors duration-300">Access compute power from around the world</p>
            </div>
          </div>
        </div>
      </section>

      {/* Built at Spurhacks Section */}
      <section className="relative z-10 py-20 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center space-x-6">
            <span className="text-gray-400 text-lg hover:text-gray-300 transition-colors duration-300">Built at</span>
            <a 
              href="https://devpost.com/software/cacheout?ref_content=user-portfolio&ref_feature=in_progress"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent hover:from-orange-300 hover:via-orange-400 hover:to-orange-500 hover:scale-105 transition-all duration-300 border-b border-orange-500/30 hover:border-orange-400/50"
            >
              Spurhacks
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 border-t border-white/10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 hover:scale-105 transition-transform duration-300 cursor-default">
            Ready to get started?
          </h2>
          <p className="text-gray-400 text-lg mb-8 hover:text-gray-300 transition-colors duration-300">
            Join a trusted community of developers and creators
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/waitlist')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Get Started
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
