import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Inbox } from './components/Inbox'
import { WorkflowList } from './components/WorkflowList'
import { FocusMode } from './components/FocusMode'
import { NaturalLanguageCreator } from './components/NaturalLanguageCreator'
import { Dashboard } from './components/Dashboard'
import { PriorityInbox } from './components/PriorityInbox'
import { AIReply } from './components/AIReply'
import { TemplateMarket } from './components/TemplateMarket'
import { ExecutionHistory } from './components/ExecutionHistory'
import { ConflictDetector } from './components/ConflictDetector'
import { AIOptimizer } from './components/AIOptimizer'
import { MeetingAssistant } from './components/MeetingAssistant'
import { EmailConnect } from './components/EmailConnect'
import { inboxAPI } from './api/client'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showEmailConnect, setShowEmailConnect] = useState(false)
  const [connectedEmails, setConnectedEmails] = useState<string[]>([])
  
  // Check for connected emails on app load
  useEffect(() => {
    checkConnectedEmails()
  }, [])
  
  // Listen for tab change events from child components
  useEffect(() => {
    const handleChangeTab = (e: CustomEvent) => {
      setActiveTab(e.detail);
    };
    window.addEventListener('changeTab', handleChangeTab as EventListener);
    return () => window.removeEventListener('changeTab', handleChangeTab as EventListener);
  }, [])
  
  const checkConnectedEmails = async () => {
    // In a real app, this would fetch from an API
    // For now, we'll check localStorage
    const savedEmails = localStorage.getItem('connectedEmails')
    if (savedEmails) {
      setConnectedEmails(JSON.parse(savedEmails))
    } else {
      // Show email connect modal if no emails are connected
      setShowEmailConnect(true)
    }
  }
  
  const handleEmailConnect = async (email: string, password: string, provider: string) => {
    try {
      console.log('Attempting to connect email:', email, 'provider:', provider)
      // Call backend API to connect email
      const response = await inboxAPI.connectEmail(email, password, provider)
      console.log('Email connected successfully:', response)
      
      // Update local state and localStorage
      const updatedEmails = [...connectedEmails, email]
      setConnectedEmails(updatedEmails)
      localStorage.setItem('connectedEmails', JSON.stringify(updatedEmails))
      setShowEmailConnect(false)
    } catch (error: any) {
      console.error('Failed to connect email:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      })
      // Extract error message from response
      let errorMessage = 'Failed to connect email. Please check your credentials.'
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail
      } else if (error.message) {
        errorMessage = error.message
      }
      // Re-throw with detailed error message
      throw new Error(errorMessage)
    }
  }
  
  const handleAddAnotherEmail = () => {
    setShowEmailConnect(true)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'inbox':
        return <Inbox />
      case 'priority':
        return <PriorityInbox />
      case 'workflows':
        return <WorkflowList />
      case 'create':
        return <NaturalLanguageCreator />
      case 'focus':
        return <FocusMode />
      case 'reply':
        return <AIReply />
      case 'templates':
        return <TemplateMarket />
      case 'history':
        return <ExecutionHistory />
      case 'conflicts':
        return <ConflictDetector />
      case 'optimizer':
        return <AIOptimizer />
      case 'meetings':
        return <MeetingAssistant />
      case 'dashboard':
        return <Dashboard />
      case 'settings':
        return <div className="p-8 text-center text-gray-500">Settings coming soon...</div>
      default:
        return <Inbox />
    }
  }

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        connectedEmails={connectedEmails}
        onAddEmail={handleAddAnotherEmail}
      />
      <main className="flex-1 h-full w-full overflow-auto p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {renderContent()}
      </main>
      {showEmailConnect && (
        <EmailConnect 
          onConnect={handleEmailConnect} 
          onClose={() => setShowEmailConnect(false)} 
        />
      )}
    </div>
  )
}

export default App
