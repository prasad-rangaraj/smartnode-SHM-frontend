import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { User, LogOut, Mail, BadgeCheck, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileDrawer = ({ open, onOpenChange }: ProfileDrawerProps) => {
  const logout = useAppStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    onOpenChange(false);
    logout();
    navigate('/login');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col gap-0" side="right">
        <SheetHeader className="px-6 py-8 border-b border-border bg-gradient-to-b from-slate-50 to-white pt-16 text-center">
             <div className="w-24 h-24 mx-auto bg-white rounded-full p-1 border-2 border-slate-100 shadow-sm mb-4">
               <Avatar className="w-full h-full">
                 <AvatarImage src="https://github.com/shadcn.png" />
                 <AvatarFallback>JD</AvatarFallback>
               </Avatar>
             </div>
             <SheetTitle className="text-xl">John Doe</SheetTitle>
             <SheetDescription className="flex items-center justify-center gap-2">
                <BadgeCheck className="w-4 h-4 text-blue-500" /> Senior Structural Engineer
             </SheetDescription>
             <div className="flex items-center justify-center gap-2 mt-2">
               <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold border border-slate-200">Level 4 Clearance</span>
               <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-bold border border-primary/20">Admin</span>
             </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-2xl font-bold text-slate-900">4,120</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Hours Logged</div>
             </div>
             <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-2xl font-bold text-slate-900">128</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Reports Filed</div>
             </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-2">Contact Info</h3>
             <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>john.doe@works.gov</span>
                </div>
                 <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Central Monitoring Station, Zone A</span>
                </div>
                 <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Shift: 08:00 - 16:00 UTC</span>
                </div>
             </div>
          </div>

           <div className="space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-2">Security</h3>
             <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex gap-3">
               <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
               <div>
                  <h4 className="text-sm font-bold text-emerald-900">2FA Enabled</h4>
                  <p className="text-xs text-emerald-700">Your account is secured with hardware key authentication.</p>
               </div>
             </div>
          </div>

        </div>

        <SheetFooter className="px-6 py-4 border-t border-border bg-white">
            <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
