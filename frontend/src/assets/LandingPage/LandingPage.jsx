import '../../css/App.css';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import { useState } from 'react';
import LoginSession from './StartSession/LoginSession';

export default function LandingPage() {
    const [showLogin, setShowLogin] = useState(false);
    return (
        <>
            {showLogin && <LoginSession setShowLogin={setShowLogin} />}

            <Header />
            <Main setShowLogin={setShowLogin} />
            <Footer></Footer>
        </>
    );
}
