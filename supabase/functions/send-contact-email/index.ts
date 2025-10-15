import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactFormData {
  name: string
  surname: string
  email: string
  organization: string
  link?: string
  message: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, surname, email, organization, link, message }: ContactFormData = await req.json()

    // Validate required fields
    if (!name || !surname || !email || !organization || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create email content
    const subject = "Барање за насока – Access to Finance"
    const emailBody = `
Ново барање за насока - Access to Finance:

Име: ${name}
Презиме: ${surname}
Email: ${email}
Организација: ${organization}
${link ? `Линк: ${link}` : ''}

Порака:
${message}

--
Оваа порака е испратена од контакт формата на FundingMacedonia.mk
    `.trim()

    // Send email using a simple SMTP approach or email service
    // For production, configure with your preferred email service (Resend, SendGrid, etc.)

    console.log('Contact form submission:', { name, surname, email, organization, link, message })
    console.log('Email would be sent to: info@solveo.co')
    console.log('Subject:', subject)
    console.log('Body:', emailBody)

    // For now, we'll simulate email sending
    // In production, replace this with actual email service integration

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
          to: ['Info@solveo.co'],
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
        message: 'Пораката е успешно испратена!'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error processing contact form:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})