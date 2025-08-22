// emails/OrderConfirmationTemplate.jsx
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Button,
} from '@react-email/components';
import * as React from 'react';

export const OrderConfirmationTemplate = ({
                                              userDisplayName = 'there',
                                              companyName = 'Your App Name',
                                              orderId = '#12345',
                                              orderDate = 'August 20, 2025',
                                              orderSummaryUrl = 'https://yourapp.com/orders/12345',
                                          }) => {
    return (
        <Html>
            <Head />
            <Preview>Your order {orderId} has been confirmed!</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Logo */}
                    <Section style={logoSection}>
                        <Img
                            src="https://via.placeholder.com/150x50/4F46E5/FFFFFF?text=LOGO"
                            width="150"
                            height="50"
                            alt={companyName}
                            style={logo}
                        />
                    </Section>

                    {/* Heading */}
                    <Heading style={heading}>Order Confirmation 🎉</Heading>

                    {/* Greeting */}
                    <Text style={paragraph}>
                        Hi {userDisplayName},
                    </Text>

                    {/* Message */}
                    <Text style={paragraph}>
                        Thanks for your purchase! We’re excited to let you know that your order <b>{orderId}</b> placed on <b>{orderDate}</b> has been confirmed and is being processed.
                    </Text>

                    {/* Order details */}
                    <Section style={featuresSection}>
                        <Text style={featuresTitle}>Order Summary:</Text>
                        <ul style={featuresList}>
                            <li style={featureItem}>🛍️ Order ID: {orderId}</li>
                            <li style={featureItem}>📅 Order Date: {orderDate}</li>
                            <li style={featureItem}>💳 Payment: Confirmed</li>
                            <li style={featureItem}>📦 Status: Processing</li>
                        </ul>
                    </Section>

                    {/* CTA */}
                    <Section style={buttonSection}>
                        <Button style={button} href={orderSummaryUrl}>
                            View My Order
                        </Button>
                    </Section>

                    {/* Extra Info */}
                    <Text style={paragraph}>
                        We’ll send you another update once your order has been shipped.
                        If you have any questions, feel free to reach out.
                    </Text>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            Thank you for shopping with {companyName}!
                            <br />– The {companyName} Team
                        </Text>
                    </Section>

                    {/* Support */}
                    <Section style={supportSection}>
                        <Text style={supportText}>
                            Need help? <Link href="mailto:support@yourapp.com" style={link}>Contact Support</Link> or
                            visit our <Link href="https://yourapp.com/help" style={link}>Help Center</Link>
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

// Reuse same styles from WelcomeTemplate
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '580px',
};

const logoSection = {
    padding: '32px 20px',
    textAlign: 'center',
};

const logo = {
    margin: '0 auto',
};

const heading = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    margin: '0 0 30px',
    padding: '0 20px',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#374151',
    padding: '0 20px',
    margin: '0 0 20px',
};

const featuresSection = {
    padding: '0 20px',
    margin: '24px 0',
};

const featuresTitle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 16px',
};

const featuresList = {
    margin: '0',
    padding: '0',
    listStyle: 'none',
};

const featureItem = {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#374151',
    margin: '0 0 8px',
    padding: '8px 16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '6px',
    border: '1px solid #E5E7EB',
};

const buttonSection = {
    textAlign: 'center',
    margin: '32px 0',
    padding: '0 20px',
};

const button = {
    backgroundColor: '#4F46E5',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'inline-block',
    padding: '14px 32px',
    border: 'none',
    cursor: 'pointer',
};

const footer = {
    padding: '0 20px',
    margin: '32px 0 0',
};

const footerText = {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#374151',
    margin: '0',
};

const supportSection = {
    backgroundColor: '#F9FAFB',
    padding: '20px',
    margin: '32px 20px 0',
    borderRadius: '8px',
    textAlign: 'center',
};

const supportText = {
    fontSize: '14px',
    lineHeight: '20px',
    color: '#6B7280',
    margin: '0',
};

const link = {
    color: '#4F46E5',
    textDecoration: 'underline',
};

export default OrderConfirmationTemplate;
