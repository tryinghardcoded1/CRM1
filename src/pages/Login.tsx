import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/common/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/card';
import { Navigate } from 'react-router-dom';
import { Input } from '@/components/common/input';
import { Label } from '@/components/common/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/tabs';
import { toast } from 'sonner';

export default function Login() {
  const { user, signIn, signInWithEmail, signUpWithEmail, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleEmailAuth = async (isRegister: boolean, e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      if (err.message.includes('auth/invalid-credential')) {
        toast.error('Invalid email or password');
      } else if (err.message.includes('auth/email-already-in-use')) {
        toast.error('Email is already registered');
      } else if (err.message.includes('auth/configuration-not-found') || err.message.includes('auth/operation-not-allowed')) {
        toast.error('Developer Alert: Email/Password authentication is not enabled. Please enable it in the Firebase Console under the Authentication tab.');
      } else {
        toast.error(err.message || 'Authentication failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          CRM
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to access your sales dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[400px]">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl">Welcome back</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={(e) => handleEmailAuth(false, e)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input id="email-login" type="email" placeholder="m@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-login">Password</Label>
                    <Input id="password-login" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full" 
                    disabled={isSubmitting}
                    onClick={async () => {
                      setIsSubmitting(true);
                      try {
                        await signInWithEmail('user@gmail.com', 'Password1');
                      } catch (err: any) {
                        if (err.message.includes('auth/invalid-credential')) {
                          toast.error('Demo account credentials incorrect. Make sure the account exists in Firebase Auth!');
                        } else if (err.message.includes('configuration-not-found') || err.message.includes('operation-not-allowed')) {
                          toast.error('Email/Password auth is not enabled in Firebase console.');
                        } else {
                          toast.error(err.message || 'Demo login failed');
                        }
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                  >
                    Demo Login (user@gmail.com)
                  </Button>
                </form>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={signIn} disabled={isSubmitting}>
                  Google
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl">Create an account</CardTitle>
                <CardDescription>
                  Enter your details to register a new account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={(e) => handleEmailAuth(true, e)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-register">Email</Label>
                    <Input id="email-register" type="email" placeholder="m@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-register">Password</Label>
                    <Input id="password-register" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Register"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or register with</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={signIn} disabled={isSubmitting}>
                  Google
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
