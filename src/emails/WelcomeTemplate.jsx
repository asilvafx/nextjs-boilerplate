// emails/WelcomeTemplate.jsx
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

export const WelcomeTemplate = ({
                                    userDisplayName = 'there',
                                    companyName = 'Your App Name',
                                    loginUrl = 'https://yourapp.com/login',
                                }) => {
    return (
        <Html>
            <Head />
            <Preview>Welcome to {companyName}! Your account has been created successfully.</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Logo Section */}
                    <Section style={logoSection}>
                        <Img
                            src="https://via.placeholder.com/150x50/4F46E5/FFFFFF?text=LOGO"
                            width="150"
                            height="50"
                            alt={companyName}
                            style={logo}
                        />
                    </Section>

                    {/* Header */}
                    <Heading style={heading}>Welcome to {companyName}! 🎉</Heading>

                    {/* Greeting */}
                    <Text style={paragraph}>
                        Hi {userDisplayName},
                    </Text>

                    {/* Main Message */}
                    <Text style={paragraph}>
                        Welcome to {companyName}! We're thrilled to have you on board. Your account has been
                        created successfully, and you're now ready to explore all the amazing features we have to offer.
                    </Text>

                    {/* Features Section */}
                    <Section style={featuresSection}>
                        <Text style={featuresTitle}>Here's what you can do with {companyName}:</Text>
                        <ul style={featuresList}>
                            <li style={featureItem}>🚀 Access your personalized dashboard</li>
                            <li style={featureItem}>📊 Track your progress and analytics</li>
                            <li style={featureItem}>🔒 Secure data protection and privacy</li>
                            <li style={featureItem}>💬 24/7 customer support</li>
                        </ul>
                    </Section>

                    {/* CTA Button */}
                    <Section style={buttonSection}>
                        <Button style={button} href={loginUrl}>
                            Get Started Now
                        </Button>
                    </Section>

                    <Text style={paragraph}>
                        If you have any questions or need help getting started, don't hesitate to reach out
                        to our support team. We're here to help you succeed!
                    </Text>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            Best regards,<br />
                            The {companyName} Team
                        </Text>
                    </Section>

                    {/* Support Section */}
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

// Styles
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

export default WelcomeTemplate;
