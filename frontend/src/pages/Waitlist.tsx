import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";

const Waitlist = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to join waitlist');
      }

      setIsSubmitted(true);
      setEmail("");
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          setError("This email is already on the waitlist!");
        } else {
          setError("Failed to join waitlist. Please try again.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative animate-fade-in">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      
      {/* Header overlaid on top */}
      <Header />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center pt-20">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-md mx-auto">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 text-white">
              <CardHeader className="text-center">
                <div className="mb-4 p-4 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full backdrop-blur-sm w-fit mx-auto">
                  {isSubmitted ? (
                    <CheckCircle className="h-8 w-8 text-green-300" />
                  ) : error ? (
                    <AlertCircle className="h-8 w-8 text-red-300" />
                  ) : (
                    <Mail className="h-8 w-8 text-indigo-300" />
                  )}
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  {isSubmitted ? "You're on the list!" : "Join the Waitlist"}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {isSubmitted 
                    ? "Thanks for joining! We'll notify you when CacheOut launches."
                    : "Be the first to know when CacheOut goes live. Get early access to the future of distributed computing."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
                        {error}
                      </div>
                    )}
                    <div>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Joining..." : "Join Waitlist"}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center">
                    <p className="text-green-300 mb-4">✨ Welcome to the community!</p>
                    <Button 
                      onClick={() => window.history.back()}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                    >
                      Go Back
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Waitlist;
