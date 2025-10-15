import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FundingSourceSuggestionData {
  contactPerson: string
  email: string
  organizationName: string
  programLink: string
  message: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { contactPerson, email, organizationName, programLink, message }: FundingSourceSuggestionData = await req.json()

    // Validate required fields
    if (!contactPerson || !email || !organizationName || !programLink || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create email content
    const subject = "Предлог за нов извор за финансирање"
    const emailBody = `
Нов предлог за извор за финансирање:

Лице за контакт: ${contactPerson}
Email: ${email}
Назив на организацијата: ${organizationName}
Линк до програмата: ${programLink}

Порака:
${message}

--
Оваа порака е испратена од формата за предлог на извори за финансирање на FundingMacedonia.mk
    `.trim()

    // For now, we'll simulate email sending
    // In production, replace this with actual email service integration

    console.log('Funding source suggestion submission:', { contactPerson, email, organizationName, programLink, message })
    console.log('Email would be sent to: info@solveo.co')
    console.log('Subject:', subject)
    console.log('Body:', emailBody)

    // Example implementation with Resend (if you have RESEND_API_KEY configured):
    /*
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'contact@fundingmacedonia.mk',
          to: ['info@solveo.co'],
          subject: subject,
          text: emailBody,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to send email')
      }
    } else {
      console.warn('RESEND_API_KEY not configured, email not sent')
    }
    */

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Вашето прашање е успешно испратено. Ви благодариме!'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error processing funding question:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})