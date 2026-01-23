
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import ServiceDetails from './components/ServiceDetails';
import WeiboSection from './components/WeiboSection';
import Footer from './components/Footer';
import { ModalManager } from './components/Modals';

const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openModal = (id: string) => {
    if (id === 'contact') {
      const footer = document.querySelector('footer');
      footer?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveModal(id);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-orange-100 selection:text-orange-600">
      <Header 
        isScrolled={isScrolled} 
        openModal={openModal} 
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />
      <main className="flex-grow">
        <Hero onDownload={() => openModal('download')} />
        <Features />
        <ServiceDetails />
        <WeiboSection />
      </main>
      <Footer openModal={openModal} />
      
      <ModalManager 
        activeModal={activeModal} 
        onClose={() => setActiveModal(null)} 
        onLogin={handleLogin}
      />
    </div>
  );
};

export default App;
