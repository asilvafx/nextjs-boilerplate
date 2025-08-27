import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MainLayout({ children }) {
    return (
        <div className="container">
            <div className="screen">
                <Header />
                {children}
                <Footer />
            </div>
        </div>
    );
}
