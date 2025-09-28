// /api/sendgrid-contact.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    try {
        const { name, email, topic, message } = req.body || {};
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const msg = {
            to: process.env.SENDGRID_TO || 'support@mrspinny.com',
            from: process.env.SENDGRID_FROM || 'noreply@mrspinny.win', // must be on your authenticated domain
            replyTo: { email, name }, // so support can reply directly to the user
            templateId: process.env.SENDGRID_TEMPLATE_ID, // d-xxxx
            dynamicTemplateData: { name, email, topic, message },
            // Recommend disabling tracking for transactional contact messages
            mailSettings: {
                clickTracking: { enable: false, enableText: false },
                openTracking: { enable: false },
                sandboxMode: { enable: false }
            },
            // Optional: add a category to help filter in SendGrid
            categories: ['contact-form']
        };

        await sgMail.send(msg);
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('SendGrid error:', err?.response?.body || err);
        return res.status(500).json({ error: 'Failed to send' });
    }
}
