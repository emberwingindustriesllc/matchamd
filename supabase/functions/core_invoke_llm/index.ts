const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

    let responseText = '';

    if (geminiApiKey) {
      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errText}`);
      }

      const result = await response.json();
      responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (openAiApiKey) {
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
      }

      const result = await response.json();
      responseText = result.choices?.[0]?.message?.content || '';
    } else {
      // Fallback/Mock Response if no keys are configured
      console.warn('Neither GEMINI_API_KEY nor OPENAI_API_KEY is configured in Supabase Secrets.');
      
      // Simple mock expert response generator based on the prompt content
      if (prompt.toLowerCase().includes('pathway 1')) {
        responseText = `Based on your query regarding Pathway 1:
        
Pathway 1 is for physicians who hold (or have held) an unrestricted license to practice medicine in the country where their medical school is located. 

Key details:
- You must hold a license that is unrestricted and not provisional or temporary.
- You must have obtained the license on or after January 1, 2015.
- You will need to request the licensing authority to send a Certificate of Good Standing directly to ECFMG.

*Note: Since no API keys (GEMINI_API_KEY / OPENAI_API_KEY) are set in the Supabase environment secrets, this is a simulated response.*`;
      } else if (prompt.toLowerCase().includes('pathway 3') || prompt.toLowerCase().includes('wfme')) {
        responseText = `Based on your query regarding Pathway 3:

Pathway 3 is for applicants whose medical school is accredited by an agency recognized by the World Federation for Medical Education (WFME).

Key details:
- Your medical school must meet WFME accreditation requirements.
- ECFMG verifies WFME status through the World Directory of Medical Schools (WDOMS).
- Check the World Directory (search for your school, look for the ECFMG Sponsor Note tab) to see if it is eligible.

*Note: Since no API keys (GEMINI_API_KEY / OPENAI_API_KEY) are set in the Supabase environment secrets, this is a simulated response.*`;
      } else {
        responseText = `Hi! I am the MatchaMD ECFMG Pathway Eligibility Assistant.

I am currently running in **Simulation Mode** because no API keys (GEMINI_API_KEY or OPENAI_API_KEY) have been configured in your Supabase secrets yet. 

To enable full AI intelligence:
1. Obtain a Gemini API Key from Google AI Studio, or an OpenAI API Key.
2. Set the secret in your Supabase project:
   \`supabase secrets set GEMINI_API_KEY=your_key\` or \`supabase secrets set OPENAI_API_KEY=your_key\`
3. Deploy this function.

Let me know if you have questions about ECFMG Pathway eligibility, USMLE exams, or documentation verification!`;
      }
    }

    return new Response(JSON.stringify({ result: responseText }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('core_invoke_llm error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
