import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, UserPlus, LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      login(data.token, data.user);
      
      // Role-based Redirect
      if (email === 'worker@smartnode.io') {
         toast.success('Field Ops Mode Activated');
         navigate('/worker');
      } else {
         toast.success('Welcome back, Commander.');
         navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      login(data.token, data.user);
      toast.success('Clearance granted. Welcome to SmartNode-SHM.');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500 rounded-full blur-[120px]" />
      </div>

      <Card className="w-[400px] z-10 glass-card bg-white/10 border-white/20 backdrop-blur-xl shadow-2xl text-white">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/50">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">SmartNode-SHM Access</CardTitle>
          <CardDescription className="text-slate-400">Secure Structural Monitoring System</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="commander@SmartNode-SHM.io" 
                    className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    className="bg-slate-950/50 border-slate-700 text-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 transition-all font-semibold" disabled={loading}>
                  {loading ? 'Authenticating...' : <><LogIn className="w-4 h-4 mr-2" /> Access Dashboard</>}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input 
                    id="reg-email" 
                    type="email" 
                    placeholder="new.user@SmartNode-SHM.io" 
                    className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input 
                    id="reg-password" 
                    type="password" 
                    className="bg-slate-950/50 border-slate-700 text-white"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>
                 <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 transition-all font-semibold" disabled={loading}>
                  {loading ? 'Registering...' : <><UserPlus className="w-4 h-4 mr-2" /> Create Clearance</>}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center text-xs text-slate-500 flex justify-center pb-6">
           Authorized Personnel Only. System activity is monitored.
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
