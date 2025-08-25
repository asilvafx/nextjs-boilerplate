import Link from 'next/link';

const HeroSection = () => {
    const features = [
        {
            icon: "✨",
            title: "Intuitive Readings",
            description: "Deep insights that resonate with your personal journey and current life situation."
        },
        {
            icon: "🌙",
            title: "Compassionate Guidance",
            description: "Safe, non-judgmental space to explore your questions and find clarity."
        },
        {
            icon: "🔮",
            title: "Practical Wisdom",
            description: "Actionable advice you can apply immediately to create positive change."
        },
        {
            icon: "💫",
            title: "Personalized Approach",
            description: "Every reading is tailored to your unique needs and spiritual path."
        }
    ];

    return (
        <div className="card">
            <h2 className="max-w-sm">Find clarity with a tarot reading that listens.</h2>
            <p className="subtitle">
                I blend practical insight with compassionate intuition to help you make confident choices about love,
                career, and life transitions.
            </p>
            <span className="badge absolute top-0 right-0 m-3">
                    30‑min intro: Free
            </span>

            <div className="button-group">
                <Link href="/shop" className="button primary">
                    Products & Services
                </Link>
                <a href="#booking" className="button">
                    Learn more
                </a>
            </div>

            {/* Features */}
            <div id="features" className="features-section">
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">
                                {feature.icon}
                            </div>
                            <div className="feature-content">
                                <h4>{feature.title}</h4>
                                <p className="text-xs">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
