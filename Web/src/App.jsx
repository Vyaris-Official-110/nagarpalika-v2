import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LangProvider } from './context/LangContext'
import { CandidateAuthProvider } from './context/CandidateAuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Careers from './pages/Careers'
import Notices from './pages/Notices'
import Results from './pages/Results'
import CallLetter from './pages/CallLetter'
import Contact from './pages/Contact'
import Help from './pages/Help'
import InstructionsStep from './pages/Registration/InstructionsStep'
import Step1Aadhaar from './pages/Registration/Step1Aadhaar'
import Step2Personal from './pages/Registration/Step2Personal'
import Step3Contact from './pages/Registration/Step3Contact'
import Step4Address from './pages/Registration/Step4Address'
import Step5OtherDetails from './pages/Registration/Step5OtherDetails'
import Step6Languages from './pages/Registration/Step6Languages'
import Step8Photo from './pages/Registration/Step8Photo'
import Step9Signature from './pages/Registration/Step9Signature'
import StepDeclaration from './pages/Registration/StepDeclaration'
import Step10Preview from './pages/Registration/Step10Preview'
import FindRegistration from './pages/Registration/FindRegistration'
import ForgotPassword from './pages/Registration/ForgotPassword'
import EditRegistration from './pages/Registration/EditRegistration'
import EditVerify from './pages/Registration/EditVerify'

function Layout({ children }) {
  return (
    <>
      <Header />
      <main id="main" className="container">
        {children}
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <CandidateAuthProvider>
          <Routes>
            <Route path="/"                         element={<Layout><Home /></Layout>} />
            <Route path="/about"                    element={<Layout><About /></Layout>} />
            <Route path="/careers"                  element={<Layout><Careers /></Layout>} />
            <Route path="/notices"                  element={<Layout><Notices /></Layout>} />
            <Route path="/results"                  element={<Layout><Results /></Layout>} />
            <Route path="/callletter"               element={<Layout><CallLetter /></Layout>} />
            <Route path="/contact"                  element={<Layout><Contact /></Layout>} />
            <Route path="/help"                     element={<Layout><Help /></Layout>} />

            {/* OTR — Instructions gate (gap 1) */}
            <Route path="/otr/instructions"         element={<Layout><InstructionsStep /></Layout>} />

            {/* OTR — Registration steps */}
            <Route path="/otr"                      element={<Layout><Step1Aadhaar /></Layout>} />
            <Route path="/otr/step/1"               element={<Layout><Step1Aadhaar /></Layout>} />
            <Route path="/otr/step/2"               element={<Layout><Step2Personal /></Layout>} />
            <Route path="/otr/step/3"               element={<Layout><Step3Contact /></Layout>} />
            <Route path="/otr/step/4"               element={<Layout><Step4Address /></Layout>} />
            <Route path="/otr/step/5"               element={<Layout><Step5OtherDetails /></Layout>} />
            <Route path="/otr/step/6"               element={<Layout><Step6Languages /></Layout>} />
            <Route path="/otr/step/7"               element={<Layout><Step8Photo /></Layout>} />
            <Route path="/otr/step/8"               element={<Layout><Step9Signature /></Layout>} />
            <Route path="/otr/step/9"               element={<Layout><StepDeclaration /></Layout>} />
            <Route path="/otr/step/10"              element={<Layout><Step10Preview /></Layout>} />

            {/* OTR — Account recovery */}
            <Route path="/otr/find"                 element={<Layout><FindRegistration /></Layout>} />
            <Route path="/otr/password/reset"       element={<Layout><ForgotPassword /></Layout>} />

            {/* Edit Registration */}
            <Route path="/registration/edit"        element={<Layout><EditRegistration /></Layout>} />
            <Route path="/registration/edit/verify" element={<Layout><EditVerify /></Layout>} />
          </Routes>
        </CandidateAuthProvider>
      </BrowserRouter>
    </LangProvider>
  )
}
