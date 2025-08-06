"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Home, ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-[#222222] border-[#303434] text-white">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center"
            >
              <Wallet className="w-12 h-12 text-red-400" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Page Not Found
            </CardTitle>
                          <Typography variant="muted" className="text-gray-400">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </Typography>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <Typography variant="muted" className="text-sm text-gray-500 mb-6">
                Error 404
              </Typography>
              
              <div className="space-y-3">
                <Link href="/">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Home className="w-4 h-4 mr-2" />
                    Go to Home
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <Typography variant="muted" className="text-xs text-gray-600">
            SafeSplit • Secure Bitcoin Escrow
          </Typography>
        </motion.div>
      </motion.div>
    </div>
  );
} 