import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Slots from "./pages/Slots.jsx";
import LiveCasino from "./pages/LiveCasino.jsx";
import Banking from "./pages/Banking.jsx";
import Contact from "./pages/Contact.jsx";
import Landing from "./pages/Landing.jsx";
import CloakRoute from "./components/CloakRoute.jsx";


function Blocked() {
  return (
    <main className="container" style={{ padding: "40px 16px", textAlign: "center" }}>
      <h1>Unavailable in your region</h1>
      <p className="bank-note">Thanks for your interest. This page isn’t available from your location.</p>
    </main>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={
          <CloakRoute
            landing={<Landing />}
            site={<Home />}
            blocked={<Blocked />}
            showDebug
          />
        } />
        <Route path="/landing" element={<Landing />} />
        <Route path="/slots" element={<Slots />} />
        <Route path="/live-casino" element={<LiveCasino />} />
        <Route path="/banking" element={<Banking />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </>
  );
}
