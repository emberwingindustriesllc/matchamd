import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Coins, 
  Calculator, 
  AlertTriangle, 
  Globe, 
  Plane, 
  Home as HomeIcon, 
  DollarSign, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle, 
  Briefcase, 
  GraduationCap, 
  Users, 
  Sparkles,
  Building2,
  Calendar,
  FileText
} from 'lucide-react';

const EXCHANGE_RATES = {
  Other: { code: 'USD', symbol: '$', rate: 1, name: 'US Dollars' },
  Pakistan: { code: 'PKR', symbol: 'Rs.', rate: 280, name: 'Pakistani Rupee' },
  India: { code: 'INR', symbol: '₹', rate: 83, name: 'Indian Rupee' },
  Bangladesh: { code: 'BDT', symbol: '৳', rate: 117, name: 'Bangladeshi Taka' },
  Nepal: { code: 'NPR', symbol: 'रू', rate: 133, name: 'Nepalese Rupee' }
};

export function calculateErasFees(count) {
  if (count <= 0) return 0;
  if (count <= 10) return 99;
  
  let total = 99;
  
  if (count <= 20) {
    total += (count - 10) * 23;
  } else {
    total += 10 * 23; 
    
    if (count <= 30) {
      total += (count - 20) * 27;
    } else {
      total += 10 * 27; 
      total += (count - 30) * 32;
    }
  }
  return total;
}

export default function MatchCostCalculator() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load profile country if available
  const { data: profiles } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const profile = profiles?.[0];
  const profileCountry = profile?.country;

  // Selected Country for Currency Conversion
  const [selectedCountry, setSelectedCountry] = useState('Other');

  // Sliders & Toggles State
  const [exams, setExams] = useState({
    step1: true,
    step2ck: true,
    step3: false,
    oet: true,
    ecfmgCert: true,
  });

  const [rotationsCount, setRotationsCount] = useState(3);
  const [rotationPrice, setRotationPrice] = useState(2500);

  const [tripsCount, setTripsCount] = useState(1);
  const [flightPrice, setFlightPrice] = useState(1200);
  const [lodgingMonths, setLodgingMonths] = useState(3);
  const [monthlyRent, setMonthlyRent] = useState(1500);

  const [erasProgramsCount, setErasProgramsCount] = useState(150);

  const [useAgency, setUseAgency] = useState(false);
  const [agencyCost, setAgencyCost] = useState(3000);

  // Sync country selection with user profile country on load
  useEffect(() => {
    if (profileCountry && EXCHANGE_RATES[profileCountry]) {
      setSelectedCountry(profileCountry);
    }
  }, [profileCountry]);

  // Calculations
  const examCosts = 
    (exams.step1 ? 1000 : 0) +
    (exams.step2ck ? 1000 : 0) +
    (exams.step3 ? 900 : 0) +
    (exams.oet ? 350 : 0) +
    (exams.ecfmgCert ? 800 : 0);

  const rotationsCost = rotationsCount * rotationPrice;
  const travelCost = (tripsCount * flightPrice) + (lodgingMonths * monthlyRent);
  const erasCost = calculateErasFees(erasProgramsCount);
  const agencyTotalCost = useAgency ? agencyCost : 0;

  const totalCostUsd = examCosts + rotationsCost + travelCost + erasCost + agencyTotalCost;
  const currencyInfo = EXCHANGE_RATES[selectedCountry] || EXCHANGE_RATES.Other;
  const totalCostLocal = totalCostUsd * currencyInfo.rate;

  const handleExamsChange = (key, value) => {
    setExams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header 
        title="Match Budget Planner" 
        leftContent={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => navigate(createPageUrl('Dashboard'))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        }
      />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        
        {/* Header Intro */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-slate-850 dark:text-white">Cost & Budget Strategy</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Estimate, visualize, and optimize your U.S. residency matching budget.
          </p>
        </div>

        {/* Dynamic Live Summary Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-6 text-white shadow-xl"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 rounded-full px-3 py-1">
                Estimated Matching Budget
              </span>
              <Coins className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <p className="text-3xl font-extrabold">${totalCostUsd.toLocaleString('en-US')}</p>
              <p className="text-sm text-white/80">Total in US Dollars (USD)</p>
            </div>

            {selectedCountry !== 'Other' && (
              <div className="pt-2 border-t border-white/20">
                <p className="text-2xl font-bold">
                  {currencyInfo.symbol}{Math.round(totalCostLocal).toLocaleString('en-US')}
                </p>
                <p className="text-xs text-white/85">
                  Equivalent in {currencyInfo.name} ({currencyInfo.code}) @ 1 USD = {currencyInfo.rate} {currencyInfo.code}
                </p>
                <p className="text-[10px] text-amber-200 mt-1 italic font-medium">
                  ⚠️ Currency exchange rates significantly amplify costs in South Asian home countries.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Primary Page Navigation Tabs */}
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid grid-cols-2 rounded-xl p-1 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="calculator" className="rounded-lg text-sm py-2">
              <Calculator className="w-4 h-4 mr-2" /> Calculator
            </TabsTrigger>
            <TabsTrigger value="guides" className="rounded-lg text-sm py-2">
              <Sparkles className="w-4 h-4 mr-2" /> IMG Strategy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6 mt-4">
            
            {/* Country Selector for Local Exchange Rates */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-sm p-4">
              <div className="space-y-2">
                <Label htmlFor="country-select" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Origin Country / Local Currency
                </Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger id="country-select" className="h-12 rounded-xl">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Other">Other / USD Only</SelectItem>
                    <SelectItem value="Pakistan">Pakistan (PKR)</SelectItem>
                    <SelectItem value="India">India (INR)</SelectItem>
                    <SelectItem value="Bangladesh">Bangladesh (BDT)</SelectItem>
                    <SelectItem value="Nepal">Nepal (NPR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Step 1: USMLE Exams & ECFMG */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">1. Exams & Certification</CardTitle>
                    <CardDescription className="text-xs">Standard licensing fees required for match eligibility</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="step1" 
                        checked={exams.step1} 
                        onCheckedChange={(checked) => handleExamsChange('step1', checked)}
                      />
                      <Label htmlFor="step1" className="text-sm font-medium">USMLE Step 1</Label>
                    </div>
                    <span className="text-sm font-bold">$1,000</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="step2ck" 
                        checked={exams.step2ck} 
                        onCheckedChange={(checked) => handleExamsChange('step2ck', checked)}
                      />
                      <Label htmlFor="step2ck" className="text-sm font-medium">USMLE Step 2 CK</Label>
                    </div>
                    <span className="text-sm font-bold">$1,000</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="step3" 
                        checked={exams.step3} 
                        onCheckedChange={(checked) => handleExamsChange('step3', checked)}
                      />
                      <Label htmlFor="step3" className="text-sm font-medium">USMLE Step 3</Label>
                    </div>
                    <span className="text-sm font-bold">$900</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="oet" 
                        checked={exams.oet} 
                        onCheckedChange={(checked) => handleExamsChange('oet', checked)}
                      />
                      <Label htmlFor="oet" className="text-sm font-medium">OET (English Proficiency)</Label>
                    </div>
                    <span className="text-sm font-bold">$350</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="ecfmgCert" 
                        checked={exams.ecfmgCert} 
                        onCheckedChange={(checked) => handleExamsChange('ecfmgCert', checked)}
                      />
                      <Label htmlFor="ecfmgCert" className="text-sm font-medium">ECFMG Certification Application</Label>
                    </div>
                    <span className="text-sm font-bold">$800</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Clinical Rotations */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-650 dark:text-emerald-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">2. Clinical Rotations (USCE)</CardTitle>
                    <CardDescription className="text-xs">Hands-on observerships or externships in U.S. hospitals</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Warnings Alert */}
                <Alert variant="warning" className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-xs font-bold uppercase tracking-wide">USCE Pain Points</AlertTitle>
                  <AlertDescription className="text-[11px] leading-relaxed">
                    Securing inpatient rotations is difficult for IMGs. You will need a B1/B2 visa, and hospitals charge high fees ($1,000–$4,000+ each) upfront with no guarantee of a Letter of Recommendation (LOR).
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {/* Rotations Count */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-650 dark:text-slate-350">Rotations Needed (2 to 4 recommended):</span>
                      <span className="font-bold text-primary">{rotationsCount}</span>
                    </div>
                    <Slider 
                      min={0} 
                      max={6} 
                      step={1} 
                      value={[rotationsCount]} 
                      onValueChange={([val]) => setRotationsCount(val)}
                    />
                  </div>

                  {/* Price Per Rotation */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-650 dark:text-slate-350">Avg Cost per Rotation:</span>
                      <span className="font-bold text-primary">${rotationPrice.toLocaleString()}</span>
                    </div>
                    <Slider 
                      min={500} 
                      max={5000} 
                      step={100} 
                      value={[rotationPrice]} 
                      onValueChange={([val]) => setRotationPrice(val)}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Rotations Cost:</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    ${rotationsCost.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Travel & Lodging */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-650 dark:text-blue-400">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">3. Travel & Accommodation</CardTitle>
                    <CardDescription className="text-xs">Airfare and monthly lodging in U.S. cities</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Airfare Count */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-650 dark:text-slate-350">U.S. Round-trips (rotations/interviews):</span>
                      <span className="font-bold text-primary">{tripsCount}</span>
                    </div>
                    <Slider 
                      min={0} 
                      max={4} 
                      step={1} 
                      value={[tripsCount]} 
                      onValueChange={([val]) => setTripsCount(val)}
                    />
                  </div>

                  {/* Flight Cost */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-650 dark:text-slate-350">Avg Flight Cost:</span>
                      <span className="font-bold text-primary">${flightPrice.toLocaleString()}</span>
                    </div>
                    <Slider 
                      min={400} 
                      max={2500} 
                      step={100} 
                      value={[flightPrice]} 
                      onValueChange={([val]) => setFlightPrice(val)}
                    />
                  </div>

                  {/* Rent Duration */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-650 dark:text-slate-350">Lodging Stay duration (Months):</span>
                      <span className="font-bold text-primary">{lodgingMonths} months</span>
                    </div>
                    <Slider 
                      min={0} 
                      max={12} 
                      step={1} 
                      value={[lodgingMonths]} 
                      onValueChange={([val]) => setLodgingMonths(val)}
                    />
                  </div>

                  {/* Rent Cost */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-650 dark:text-slate-350">Monthly Rent & Living Expenses:</span>
                      <span className="font-bold text-primary">${monthlyRent.toLocaleString()}/mo</span>
                    </div>
                    <Slider 
                      min={500} 
                      max={4000} 
                      step={100} 
                      value={[monthlyRent]} 
                      onValueChange={([val]) => setMonthlyRent(val)}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Travel Subtotal:</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    ${travelCost.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Step 4: ERAS Application Fees */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-650 dark:text-pink-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">4. ERAS Application Fees</CardTitle>
                    <CardDescription className="text-xs">ERAS fees based on the number of programs applied to</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-650 dark:text-slate-350">Programs Applied to (100–300+ typical for IMGs):</span>
                      <span className="font-bold text-primary">{erasProgramsCount} programs</span>
                    </div>
                    <Slider 
                      min={0} 
                      max={400} 
                      step={5} 
                      value={[erasProgramsCount]} 
                      onValueChange={([val]) => setErasProgramsCount(val)}
                    />
                  </div>

                  {/* Progressive Fee structure explanation */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl space-y-1 text-xs">
                    <p className="font-bold text-slate-700 dark:text-slate-300">ERAS progressive pricing model:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-500 dark:text-slate-400">
                      <li>First 10 programs: $99</li>
                      <li>11–20 programs: $23 each</li>
                      <li>21–30 programs: $27 each</li>
                      <li>31+ programs: $32 each</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ERAS Subtotal:</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    ${erasCost.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Step 5: Third-Party Agencies */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-650 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">5. Third-Party Placement Agencies</CardTitle>
                    <CardDescription className="text-xs">Consultants charging for rotation bookings and coaching</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Warning Alert */}
                <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-350">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-xs font-bold uppercase tracking-wide">Agency Risks</AlertTitle>
                  <AlertDescription className="text-[11px] leading-relaxed">
                    Be highly cautious. Agencies charge $2,000–$10,000+ but often sell overpriced rotations of low value, or worst of all, post fake LORs or are outright scams. Click "IMG Strategy" to learn how to avoid them.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="useAgency" 
                        checked={useAgency} 
                        onCheckedChange={setUseAgency}
                      />
                      <Label htmlFor="useAgency" className="text-sm font-semibold">Include Third-Party Agency Fees</Label>
                    </div>
                  </div>

                  {useAgency && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-650 dark:text-slate-350">Consultancy / Prep Cost:</span>
                        <span className="font-bold text-primary">${agencyCost.toLocaleString()}</span>
                      </div>
                      <Slider 
                        min={1000} 
                        max={12000} 
                        step={500} 
                        value={[agencyCost]} 
                        onValueChange={([val]) => setAgencyCost(val)}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Agency Subtotal:</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    ${agencyTotalCost.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          {/* TAB 2: STRATEGIC GUIDES */}
          <TabsContent value="guides" className="space-y-6 mt-4">
            
            {/* Visa & Sponsorship Strategy */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Visa & Sponsorship Filtration</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Many U.S. residency programs explicitly do not sponsor J-1 or H-1B visas. Over 50% of IMG application cost is wasted applying to programs where they are automatically filtered out.
              </p>
              <div className="bg-indigo-50 dark:bg-indigo-950/20 p-3 rounded-xl space-y-1 text-xs">
                <p className="font-bold text-indigo-800 dark:text-indigo-400">Save money on applications:</p>
                <ul className="list-decimal pl-4 space-y-1 text-slate-650 dark:text-slate-400">
                  <li>Use our <strong>Match Hub</strong> filters to find programs with J-1/H-1B sponsorship history.</li>
                  <li>Check programs for "minimum Step 2 CK cutoffs" (aim for ≥240) before spending ERAS credits.</li>
                  <li>Do not apply to programs requiring "US Citizen / Green Card" status if you require sponsorship.</li>
                </ul>
              </div>
            </Card>

            {/* Clinical Rotations without Scams */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Coins className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Vetted USCE & Cost Reduction</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Third-party placement agencies charge huge fees ($2,000–$6,000) for standard rotations, with no guarantees of a letter or quality. 
              </p>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl space-y-1.5 text-xs">
                <p className="font-bold text-emerald-800 dark:text-emerald-400">Strategies to avoid agency markup:</p>
                <ul className="list-decimal pl-4 space-y-1 text-slate-650 dark:text-slate-400">
                  <li><strong>Apply directly to university hospitals</strong>: Some offer observerships directly (typically $500–$1,000 registration fees).</li>
                  <li><strong>Target clinics run by home-country alumni</strong>: Outreach to physicians from your medical school who practice in the U.S. They will often sponsor observerships for free.</li>
                  <li><strong>Confirm Letter of Recommendation (LOR) details</strong>: Before paying anything, verify in writing whether you will get an individual letter on clinic letterhead.</li>
                </ul>
              </div>
            </Card>

            {/* Avoiding Agency Scams */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Spotting Agency Scams</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Fraudulent agencies operate aggressively targeting South Asian students. Look out for the following red flags:
              </p>
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl space-y-1.5 text-xs text-red-900 dark:text-red-300">
                <p className="font-bold">Red Flags & Protections:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-650 dark:text-slate-400">
                  <li><strong>Guaranteed Matches</strong>: Any agency claiming a "guaranteed match" or "inside connection to the PD" is fraudulent.</li>
                  <li><strong>Pre-written LoRs</strong>: Agencies that write the letters themselves rather than having the attending physician write it.</li>
                  <li><strong>No Contact details</strong>: Refusal to share the hospital/physician name until money is fully paid.</li>
                </ul>
                <p className="font-medium mt-2 pt-2 border-t border-red-150 dark:border-red-900/40 text-xs">
                  👉 Use the <strong>Community Tab</strong> to read/file reports on fraudulent agencies.
                </p>
              </div>
            </Card>

            {/* ECFMG Pathway & Credential Verification Delays */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Credentialing & School Delays</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Primary source credential verification from medical schools in Pakistan, India, Bangladesh, and Nepal can take months due to administrative processes. Delays can push back ECFMG certification, making you miss match timelines.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-xl space-y-1 text-xs">
                <p className="font-bold text-blue-800 dark:text-blue-400">Action items to bypass delays:</p>
                <ul className="list-decimal pl-4 space-y-1 text-slate-650 dark:text-slate-400">
                  <li>Begin your ECFMG application <strong>6 months ahead of ERAS</strong>.</li>
                  <li>Appoint a trusted contact person locally in your medical school to personally follow up and expedite verification requests sent by ECFMG.</li>
                  <li>Confirm that your school participates in the ECFMG Medical School Web Portal (EMSWP) for digital transmission.</li>
                </ul>
              </div>
            </Card>

            {/* Mitigating Gap Years & Structural Bias */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Managing Gap Years & Networking</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Because matching takes 2 to 5+ years, extended gap years are common for IMGs but are viewed negatively by some programs who prefer recent graduates.
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl space-y-1 text-xs">
                <p className="font-bold text-amber-800 dark:text-amber-400">Overcoming gap bias & limited networks:</p>
                <ul className="list-decimal pl-4 space-y-1 text-slate-650 dark:text-slate-400">
                  <li><strong>Continuous clinical or research activity</strong>: Do not leave gaps empty. Work as a medical officer at home, publish case reports, or work as a research assistant.</li>
                  <li><strong>Cold outreach & Networking</strong>: Connect with matched alumni on LinkedIn and Twitter. Ask for 15-minute informational interviews to build organic mentorship.</li>
                  <li><strong>Seek Mentors on MatchaMD</strong>: Navigate to our <strong>Mentors Tab</strong> to get direct support from matched IMGs.</li>
                </ul>
              </div>
            </Card>

          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
