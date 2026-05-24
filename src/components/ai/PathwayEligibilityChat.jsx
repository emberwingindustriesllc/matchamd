import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/api/supabaseClient';
import { Bot, Send, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PathwayEligibilityChat({ userProfile }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your MatchaMD Assistant. I can help you determine which of the 6 ECFMG pathways you're eligible for.

Tell me about:
• Your medical school and graduation year
• Whether your school is WFME-accredited
• If you're licensed to practice medicine in your country
• Your country of medical education

Ask me anything about ECFMG pathways!`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const context = userProfile ? `
User Profile Context:
- Medical School: ${userProfile.medical_school || 'Not specified'}
- Medical School Country: ${userProfile.medical_school_country || 'Not specified'}
- Graduation Year: ${userProfile.graduation_year || 'Not specified'}
- ECFMG Certified: ${userProfile.ecfmg_certified ? 'Yes' : 'No'}
- Country: ${userProfile.country || 'Not specified'}
` : '';

      const { data, error } = await supabase.functions.invoke('core_invoke_llm', {
        body: {
          prompt: `You are an ECFMG Pathway Eligibility Expert. Help the user determine which ECFMG certification pathway they qualify for.

ECFMG Pathways (as of 2024+):
1. **Pathway 1**: For physicians with an unrestricted license to practice medicine in the country where their medical school is located
2. **Pathway 3**: Medical school is accredited by an agency recognized by the World Federation for Medical Education (WFME)
3. **Pathway 4**: Medical school participated in a clinical/practical examination review
4. **Pathway 5**: Medical school participated in an accreditation site visit
5. **Pathway 6**: Medical school submitted an accreditation data collection instrument

Key Requirements:
- All pathways require English proficiency: OET Medicine (minimum 350 per sub-test) or TOEFL iBT
- USMLE Step 1 and Step 2 CK exams required
- Medical diploma and transcripts verification

Important Notes:
- Pathway 3 (WFME-accredited) is typically the fastest - check https://www.wfme.org
- Pathway 2 was discontinued in 2023
- Post-2023 graduates may have limited options if school not WFME-accredited
- Pathway 1 requires unrestricted medical license (not temporary/provisional)

${context}

User Question: ${userMessage}

Provide a clear, concise answer. If determining eligibility, ask clarifying questions. If the user appears eligible for a pathway, clearly state which one and why. Always encourage them to verify on ECFMG.org for official confirmation.`,
          add_context_from_internet: false
        }
      });
      if (error) throw error;
      
      const responseText = data?.result || data?.response || data || 'Sorry, I am unable to process that at the moment.';

      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
      toast.error('Failed to get response. Please try again.');
      console.error('AI chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-indigo-200 dark:border-indigo-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[rgba(var(--color-primary),0.05)] to-emerald-50 dark:from-[rgba(var(--color-primary),0.1)] dark:to-emerald-950/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-emerald-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              AI Pathway Assistant
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Sparkles className="w-3 h-3 mr-1" />
                Free
              </Badge>
            </CardTitle>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Determine your ECFMG pathway eligibility instantly
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgb(var(--color-primary))] to-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-[rgb(var(--color-primary))] text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgb(var(--color-primary))] to-emerald-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-2.5 border border-slate-200 dark:border-slate-700">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask about pathway eligibility (e.g., 'I graduated in 2024 from a WFME-accredited school...')"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="min-h-[60px] max-h-[120px] rounded-xl resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="h-[60px] w-[60px] rounded-xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-emerald-600 hover:opacity-90 flex-shrink-0 text-white flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            AI guidance only - verify with ECFMG.org for official eligibility
          </p>
        </div>
      </CardContent>
    </Card>
  );
}