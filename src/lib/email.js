// lib/email.js
import { Resend } from 'resend';
import { render } from '@react-email/render';
import nodemailer from 'nodemailer';

// Email Method (nodemailer/resend)
const emailMethod = process.env.EMAIL_METHOD;
const emailFrom = process.env.RESEND_DOMAIN;
const emailName = process.env.NEXT_PUBLIC_APP_NAME;

// Resend configuration
const resend = emailMethod === 'resend' ? new Resend(process.env.RESEND_API_KEY) : null;

// Nodemailer configuration
let mailTransport = null;
if (emailMethod === 'nodemailer') {
    const nodeMailerConfig = {
        service: process.env.NODEMAILER_SERVICE || 'gmail',
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS
        }
    };

    // Support for custom SMTP configuration
    if (process.env.NODEMAILER_HOST) {
        nodeMailerConfig.host = process.env.NODEMAILER_HOST;
        nodeMailerConfig.port = process.env.NODEMAILER_PORT || 587;
        nodeMailerConfig.secure = process.env.NODEMAILER_SECURE === 'true'; // true for 465, false for other ports
        delete nodeMailerConfig.service; // Remove service when using custom SMTP
    }

    mailTransport = nodemailer.createTransport(nodeMailerConfig);
}

class EmailService {
    constructor() {
        this.fromEmail = emailFrom; // Replace with your verified domain
        this.fromName = emailName; // Replace with your app name
    }

    /**
     * Send email using Resend
     * @param {string} to - Recipient email address
     * @param {string} subject - Email subject
     * @param {string} html - HTML content
     * @param {string} text - Plain text content
     * @returns {Promise} Resend response
     */
    async sendEmailViaResend(to, subject, html, text) {
        try {
            // Validate HTML is a string
            if (typeof html !== 'string') {
                throw new Error(`HTML content must be a string, received: ${typeof html}`);
            }

            if (!html || html.trim() === '') {
                throw new Error('HTML content cannot be empty');
            }

            const emailData = {
                from: `${this.fromName} <${this.fromEmail}>`,
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
            };

            // Only add text if it's a valid string
            if (typeof text === 'string' && text.trim() !== '') {
                emailData.text = text;
            }

            console.log('Sending email with Resend:', {
                to: emailData.to,
                subject: emailData.subject,
                htmlLength: html.length,
                textLength: text?.length || 0
            });

            const response = await resend.emails.send(emailData);

            console.log('Resend email sent successfully:', response);
            return response;
        } catch (error) {
            console.error('Resend send failed:', error);
            throw error;
        }
    }

    /**
     * Send email using Nodemailer
     * @param {string} to - Recipient email address
     * @param {string} subject - Email subject
     * @param {string} html - HTML content
     * @param {string} text - Plain text content
     * @returns {Promise} Nodemailer response
     */
    async sendEmailViaNodemailer(to, subject, html, text) {
        try {
            if (!mailTransport) {
                throw new Error('Nodemailer transport not initialized. Check your NODEMAILER environment variables.');
            }

            // Validate HTML is a string
            if (typeof html !== 'string') {
                throw new Error(`HTML content must be a string, received: ${typeof html}`);
            }

            if (!html || html.trim() === '') {
                throw new Error('HTML content cannot be empty');
            }

            const mailOptions = {
                from: `${this.fromName} <${this.fromEmail}>`,
                to: Array.isArray(to) ? to.join(', ') : to,
                subject,
                html,
            };

            // Only add text if it's a valid string
            if (typeof text === 'string' && text.trim() !== '') {
                mailOptions.text = text;
            }

            console.log('Sending email with Nodemailer:', {
                to: mailOptions.to,
                subject: mailOptions.subject,
                htmlLength: html.length,
                textLength: text?.length || 0
            });

            const response = await mailTransport.sendMail(mailOptions);

            console.log('Nodemailer email sent successfully:', response);
            return response;
        } catch (error) {
            console.error('Nodemailer send failed:', error);
            throw error;
        }
    }

    /**
     * Send a generic email
     * @param {string} to - Recipient email address
     * @param {string} subject - Email subject
     * @param {React.Component} template - React email template
     * @param {Object} templateProps - Props to pass to the template
     * @returns {Promise} Email service response
     */
    async sendEmail(to, subject, template, templateProps = {}) {
        try {
            // Create the React element first
            const reactElement = template(templateProps);

            // Then render it to HTML string
            const html = await render(reactElement);
            const text = await render(reactElement, { plainText: true });

            // Debug logging
            console.log('Rendered HTML type:', typeof html);
            console.log('Rendered HTML length:', html?.length);
            console.log('Email method:', emailMethod);

            if (emailMethod === 'resend') {
                return await this.sendEmailViaResend(to, subject, html, text);
            } else if (emailMethod === 'nodemailer') {
                return await this.sendEmailViaNodemailer(to, subject, html, text);
            } else {
                throw new Error(`Unsupported email method: ${emailMethod}. Use 'resend' or 'nodemailer'.`);
            }
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }

    /**
     * Send password reset email
     * @param {string} to - Recipient email address
     * @param {string} resetCode - 6-digit reset code
     * @param {string} userDisplayName - User's display name
     * @returns {Promise} Email service response
     */
    async sendPasswordResetEmail(to, resetCode, userDisplayName = null) {
        const { PasswordResetTemplate } = await import('@/emails/PasswordResetTemplate');

        return this.sendEmail(
            to,
            'Password Reset Code',
            PasswordResetTemplate,
            {
                resetCode,
                userDisplayName,
                companyName: this.fromName, // Use configured company name
            }
        );
    }

    /**
     * Send welcome email
     * @param {string} to - Recipient email address
     * @param {string} userDisplayName - User's display name
     * @returns {Promise} Email service response
     */
    async sendWelcomeEmail(to, userDisplayName) {
        const { WelcomeTemplate } = await import('@/emails/WelcomeTemplate');

        return this.sendEmail(
            to,
            `Welcome to ${this.fromName}!`,
            WelcomeTemplate,
            {
                userDisplayName,
                companyName: this.fromName, // Use configured company name
                loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`,
            }
        );
    }

    /**
     * Send email verification
     * @param {string} to - Recipient email address
     * @param {string} verificationCode - Verification code
     * @param {string} userDisplayName - User's display name
     * @returns {Promise} Email service response
     */
    async sendEmailVerification(to, verificationCode, userDisplayName = null) {
        const { EmailVerificationTemplate } = await import('@/emails/EmailVerificationTemplate');

        return this.sendEmail(
            to,
            'Verify Your Email Address',
            EmailVerificationTemplate,
            {
                verificationCode,
                userDisplayName,
                companyName: this.fromName, // Use configured company name
            }
        );
    }

    /**
     * Send order confirmation email
     * @param {string} to - Recipient email address
     * @param {string} customerName - Customer's name
     * @param {string} orderId - Order ID
     * @param {string} orderDate - Order date
     * @param {Array} items - Array of order items
     * @param {string} subtotal - Subtotal amount
     * @param {string} shippingCost - Shipping cost
     * @param {string} total - Total amount
     * @param {Object} shippingAddress - Shipping address object
     * @returns {Promise} Email service response
     */
    async sendOrderConfirmationEmail(to, {
        customerName,
        orderId,
        orderDate,
        items,
        subtotal,
        shippingCost,
        total,
        shippingAddress
    }) {
        const { OrderConfirmationTemplate } = await import('@/emails/OrderConfirmationTemplate');

        return this.sendEmail(
            to,
            `Order Confirmation #${orderId}`,
            OrderConfirmationTemplate,
            {
                customerName,
                orderId,
                orderDate,
                items,
                subtotal: subtotal || '0.00',
                shippingCost: shippingCost || '0.00',
                total: parseFloat(total).toFixed(2),
                shippingAddress: shippingAddress || {},
                companyName: this.fromName,
                companyUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            }
        );
    }

    /**
     * Test email connection (useful for debugging)
     * @returns {Promise} Connection test result
     */
    async testConnection() {
        try {
            if (emailMethod === 'nodemailer' && mailTransport) {
                const verified = await mailTransport.verify();
                console.log('Nodemailer connection verified:', verified);
                return { success: true, method: 'nodemailer', verified };
            } else if (emailMethod === 'resend' && resend) {
                // Resend doesn't have a verify method, but we can check if it's initialized
                return { success: true, method: 'resend', verified: true };
            } else {
                throw new Error(`Unsupported email method: ${emailMethod}`);
            }
        } catch (error) {
            console.error('Email connection test failed:', error);
            return { success: false, method: emailMethod, error: error.message };
        }
    }
}

export default new EmailService();
